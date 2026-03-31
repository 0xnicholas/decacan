use std::sync::Arc;

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

use crate::entities::*;
use crate::error::{AuthError, AuthResult};
use crate::storage::UserStorage;

#[derive(Debug, Clone)]
pub struct AuthService<S: UserStorage> {
    storage: Arc<S>,
    jwt_secret: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: i64,
    iat: i64,
    typ: String,
    jti: String, // JWT ID - unique identifier for each token
}

pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

impl<S: UserStorage> AuthService<S> {
    pub fn new(storage: Arc<S>, jwt_secret: impl Into<String>) -> Self {
        Self {
            storage,
            jwt_secret: jwt_secret.into(),
        }
    }

    pub async fn find_user_by_id(&self, user_id: &str) -> AuthResult<Option<User>> {
        self.storage.find_user_by_id(user_id).await
    }

    pub async fn find_user_by_email(&self, email: &str) -> AuthResult<Option<User>> {
        self.storage.find_user_by_email(email).await
    }

    /// 验证密码复杂度
    fn validate_password(password: &str) -> AuthResult<()> {
        if password.len() < 8 {
            return Err(AuthError::Validation(
                "Password must be at least 8 characters".to_string()
            ));
        }

        // 检查是否包含至少一个大写字母
        if !password.chars().any(|c| c.is_ascii_uppercase()) {
            return Err(AuthError::Validation(
                "Password must contain at least one uppercase letter".to_string()
            ));
        }

        // 检查是否包含至少一个小写字母
        if !password.chars().any(|c| c.is_ascii_lowercase()) {
            return Err(AuthError::Validation(
                "Password must contain at least one lowercase letter".to_string()
            ));
        }

        // 检查是否包含至少一个数字
        if !password.chars().any(|c| c.is_ascii_digit()) {
            return Err(AuthError::Validation(
                "Password must contain at least one digit".to_string()
            ));
        }

        Ok(())
    }

    pub async fn register(
        &self,
        email: &str,
        password: &str,
        name: &str,
    ) -> AuthResult<(User, AuthTokens)> {
        Self::validate_password(password)?;
        
        if self.storage.find_user_by_email(email).await?.is_some() {
            return Err(AuthError::EmailAlreadyExists);
        }
        
        let password_hash = hash_password(password)?;
        
        let user = User {
            id: Uuid::new_v4().to_string(),
            email: email.to_string(),
            name: name.to_string(),
            avatar_url: None,
            status: UserStatus::Active,
            auth_provider: AuthProvider::Email,
            auth_provider_id: None,
            password_hash: Some(password_hash),
            email_verified_at: None,
            created_at: OffsetDateTime::now_utc(),
            last_login_at: Some(OffsetDateTime::now_utc()),
        };
        
        self.storage.create_user(&user).await?;
        let tokens = self.generate_tokens(&user.id).await?;
        
        Ok((user, tokens))
    }
    
    pub async fn login(
        &self,
        email: &str,
        password: &str,
    ) -> AuthResult<(User, AuthTokens)> {
        let user = self.storage
            .find_user_by_email(email)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;
        
        let hash = user.password_hash.as_ref()
            .ok_or(AuthError::InvalidCredentials)?;
        
        if !verify_password(password, hash)? {
            return Err(AuthError::InvalidCredentials);
        }
        
        self.storage.update_last_login(&user.id).await?;
        let tokens = self.generate_tokens(&user.id).await?;
        
        Ok((user, tokens))
    }
    
    pub async fn verify_token(&self,
        token: &str,
    ) -> AuthResult<String> {
        let validation = Validation::default();
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_bytes()),
            &validation,
        ).map_err(|e| match e.kind() {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => AuthError::TokenExpired,
            _ => AuthError::InvalidToken,
        })?;
        
        Ok(token_data.claims.sub)
    }
    
    pub async fn refresh_token(
        &self,
        refresh_token: &str,
    ) -> AuthResult<AuthTokens> {
        // 1. 验证 refresh token 格式
        let claims = self.verify_token(refresh_token).await?;
        
        // 2. 检查数据库中是否存在且未过期
        let session = self.storage
            .find_session_by_refresh_token(refresh_token)
            .await?
            .ok_or(AuthError::InvalidToken)?;
        
        if session.expires_at < OffsetDateTime::now_utc() {
            return Err(AuthError::TokenExpired);
        }
        
        // 3. 撤销旧的 session（token rotation）
        self.storage.revoke_session(&session.id).await?;
        
        // 4. 生成新 tokens
        let tokens = self.generate_tokens(&claims).await?;
        
        Ok(tokens)
    }
    
    pub async fn logout(
        &self,
        user_id: &str,
    ) -> AuthResult<()> {
        self.storage.revoke_all_user_sessions(user_id).await
    }
    
    async fn generate_tokens(
        &self,
        user_id: &str,
    ) -> AuthResult<AuthTokens> {
        let now = OffsetDateTime::now_utc();
        let access_expiry = Duration::minutes(15);
        let refresh_expiry = Duration::days(7);
        
        // Generate unique session ID first to use as JWT ID (jti)
        let session_id = Uuid::new_v4().to_string();
        
        let access_token = encode(
            &Header::default(),
            &Claims {
                sub: user_id.to_string(),
                exp: (now + access_expiry).unix_timestamp(),
                iat: now.unix_timestamp(),
                typ: "access".to_string(),
                jti: format!("{}-access", session_id),
            },
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        ).map_err(|e| AuthError::Internal(format!("JWT encoding failed: {}", e)))?;
        
        let refresh_token = encode(
            &Header::default(),
            &Claims {
                sub: user_id.to_string(),
                exp: (now + refresh_expiry).unix_timestamp(),
                iat: now.unix_timestamp(),
                typ: "refresh".to_string(),
                jti: format!("{}-refresh", session_id),
            },
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        ).map_err(|e| AuthError::Internal(format!("JWT encoding failed: {}", e)))?;
        
        let session = AuthSession {
            id: session_id,
            user_id: user_id.to_string(),
            access_token: access_token.clone(),
            refresh_token: refresh_token.clone(),
            expires_at: now + refresh_expiry,
            created_at: now,
            last_used_at: None,
            ip_address: None,
            user_agent: None,
        };
        
        self.storage.create_session(&session).await?;
        
        Ok(AuthTokens {
            access_token,
            refresh_token,
            expires_in: access_expiry.whole_seconds(),
        })
    }
}

fn hash_password(password: &str) -> AuthResult<String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    
    argon2.hash_password(password.as_bytes(), &salt)
        .map_err(|e| AuthError::Storage(e.to_string()))
        .map(|h| h.to_string())
}

fn verify_password(password: &str, hash: &str) -> AuthResult<bool> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| AuthError::Storage(e.to_string()))?;
    
    let argon2 = Argon2::default();
    Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
}
