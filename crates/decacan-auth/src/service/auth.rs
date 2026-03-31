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
    
    pub async fn register(
        &self,
        email: &str,
        password: &str,
        name: &str,
    ) -> AuthResult<(User, AuthTokens)> {
        if password.len() < 8 {
            return Err(AuthError::Validation(
                "Password must be at least 8 characters".to_string()
            ));
        }
        
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
    
    async fn generate_tokens(
        &self,
        user_id: &str,
    ) -> AuthResult<AuthTokens> {
        let now = OffsetDateTime::now_utc();
        let access_expiry = Duration::minutes(15);
        let refresh_expiry = Duration::days(7);
        
        let access_token = encode(
            &Header::default(),
            &Claims {
                sub: user_id.to_string(),
                exp: (now + access_expiry).unix_timestamp(),
                iat: now.unix_timestamp(),
                typ: "access".to_string(),
            },
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        ).map_err(|e| AuthError::Storage(e.to_string()))?;
        
        let refresh_token = encode(
            &Header::default(),
            &Claims {
                sub: user_id.to_string(),
                exp: (now + refresh_expiry).unix_timestamp(),
                iat: now.unix_timestamp(),
                typ: "refresh".to_string(),
            },
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        ).map_err(|e| AuthError::Storage(e.to_string()))?;
        
        let session = AuthSession {
            id: Uuid::new_v4().to_string(),
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
