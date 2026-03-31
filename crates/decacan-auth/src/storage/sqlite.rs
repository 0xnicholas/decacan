use async_trait::async_trait;
use sqlx::sqlite::SqlitePool;
use time::OffsetDateTime;

use crate::entities::*;
use crate::error::{AuthError, AuthResult};
use super::UserStorage;

pub struct SqliteUserStorage {
    pool: SqlitePool,
}

impl SqliteUserStorage {
    pub async fn new(database_url: &str) -> AuthResult<Self> {
        let pool = SqlitePool::connect(database_url)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Self::migrate(&pool).await?;
        
        Ok(Self { pool })
    }
    
    async fn migrate(pool: &SqlitePool) -> AuthResult<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                avatar_url TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                auth_provider TEXT NOT NULL,
                auth_provider_id TEXT,
                password_hash TEXT,
                email_verified_at TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login_at TIMESTAMP
            )
            "#
        )
        .execute(pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS auth_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                access_token TEXT UNIQUE NOT NULL,
                refresh_token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT
            )
            "#
        )
        .execute(pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS oauth_states (
                state TEXT PRIMARY KEY,
                provider TEXT NOT NULL,
                redirect_url TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
            "#
        )
        .execute(pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
}

#[async_trait]
impl UserStorage for SqliteUserStorage {
    async fn create_user(&self, user: &User) -> AuthResult<()> {
        sqlx::query(
            r#"
            INSERT INTO users (id, email, name, avatar_url, status, auth_provider,
                               auth_provider_id, password_hash, email_verified_at,
                               created_at, last_login_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
            "#
        )
        .bind(&user.id)
        .bind(&user.email)
        .bind(&user.name)
        .bind(&user.avatar_url)
        .bind(format!("{:?}", user.status).to_lowercase())
        .bind(format!("{:?}", user.auth_provider).to_lowercase())
        .bind(&user.auth_provider_id)
        .bind(&user.password_hash)
        .bind(user.email_verified_at)
        .bind(user.created_at)
        .bind(user.last_login_at)
        .execute(&self.pool)
        .await
        .map_err(|e| {
            // 使用 SQLx 的结构化错误检查唯一约束违反
            if let sqlx::Error::Database(db_err) = &e {
                if db_err.is_unique_violation() {
                    return AuthError::EmailAlreadyExists;
                }
            }
            AuthError::Storage(e.to_string())
        })?;
        
        Ok(())
    }
    
    async fn find_user_by_id(&self, id: &str) -> AuthResult<Option<User>> {
        let row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE id = ?1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| r.into()))
    }
    
    async fn find_user_by_email(&self, email: &str) -> AuthResult<Option<User>> {
        let row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE email = ?1"
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| r.into()))
    }
    
    async fn update_last_login(&self, id: &str) -> AuthResult<()> {
        sqlx::query("UPDATE users SET last_login_at = ?2 WHERE id = ?1")
            .bind(id)
            .bind(OffsetDateTime::now_utc())
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn create_session(&self, session: &AuthSession) -> AuthResult<()> {
        sqlx::query(
            r#"
            INSERT INTO auth_sessions
                (id, user_id, access_token, refresh_token, expires_at,
                 created_at, last_used_at, ip_address, user_agent)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            "#
        )
        .bind(&session.id)
        .bind(&session.user_id)
        .bind(&session.access_token)
        .bind(&session.refresh_token)
        .bind(session.expires_at)
        .bind(session.created_at)
        .bind(session.last_used_at)
        .bind(&session.ip_address)
        .bind(&session.user_agent)
        .execute(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn find_session_by_refresh_token(
        &self, token: &str
    ) -> AuthResult<Option<AuthSession>> {
        let row = sqlx::query_as::<_, SessionRow>(
            "SELECT * FROM auth_sessions WHERE refresh_token = ?1"
        )
        .bind(token)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| r.into()))
    }
    
    async fn revoke_session(&self, id: &str) -> AuthResult<()> {
        sqlx::query("DELETE FROM auth_sessions WHERE id = ?1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;

        Ok(())
    }

    async fn revoke_all_user_sessions(&self, user_id: &str) -> AuthResult<()> {
        sqlx::query("DELETE FROM auth_sessions WHERE user_id = ?1")
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;

        Ok(())
    }

    async fn cleanup_expired_sessions(&self) -> AuthResult<u64> {
        let result = sqlx::query("DELETE FROM auth_sessions WHERE expires_at < ?1")
            .bind(OffsetDateTime::now_utc())
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;

        Ok(result.rows_affected())
    }

    async fn create_oauth_state(&self, _state: &OAuthState) -> AuthResult<()> {
        todo!("OAuth state storage not yet implemented")
    }
    
    async fn find_oauth_state(&self, _state: &str) -> AuthResult<Option<OAuthState>> {
        Ok(None)
    }
    
    async fn delete_oauth_state(&self, _state: &str) -> AuthResult<()> {
        Ok(())
    }
}

#[derive(sqlx::FromRow)]
struct UserRow {
    id: String,
    email: String,
    name: String,
    avatar_url: Option<String>,
    status: String,
    auth_provider: String,
    auth_provider_id: Option<String>,
    password_hash: Option<String>,
    email_verified_at: Option<OffsetDateTime>,
    created_at: OffsetDateTime,
    last_login_at: Option<OffsetDateTime>,
}

impl From<UserRow> for User {
    fn from(row: UserRow) -> Self {
        Self {
            id: row.id,
            email: row.email,
            name: row.name,
            avatar_url: row.avatar_url,
            status: parse_status(&row.status),
            auth_provider: parse_provider(&row.auth_provider),
            auth_provider_id: row.auth_provider_id,
            password_hash: row.password_hash,
            email_verified_at: row.email_verified_at,
            created_at: row.created_at,
            last_login_at: row.last_login_at,
        }
    }
}

#[derive(sqlx::FromRow)]
struct SessionRow {
    id: String,
    user_id: String,
    access_token: String,
    refresh_token: String,
    expires_at: OffsetDateTime,
    created_at: OffsetDateTime,
    last_used_at: Option<OffsetDateTime>,
    ip_address: Option<String>,
    user_agent: Option<String>,
}

impl From<SessionRow> for AuthSession {
    fn from(row: SessionRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            access_token: row.access_token,
            refresh_token: row.refresh_token,
            expires_at: row.expires_at,
            created_at: row.created_at,
            last_used_at: row.last_used_at,
            ip_address: row.ip_address,
            user_agent: row.user_agent,
        }
    }
}

fn parse_status(s: &str) -> UserStatus {
    match s {
        "suspended" => UserStatus::Suspended,
        "deleted" => UserStatus::Deleted,
        _ => UserStatus::Active,
    }
}

fn parse_provider(s: &str) -> AuthProvider {
    match s {
        "google" => AuthProvider::Google,
        "github" => AuthProvider::GitHub,
        _ => AuthProvider::Email,
    }
}
