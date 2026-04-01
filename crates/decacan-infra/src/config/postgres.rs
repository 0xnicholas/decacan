use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct PostgresConfig {
    #[serde(default = "default_url")]
    pub url: String,
    #[serde(default = "default_max_connections")]
    pub max_connections: u32,
    #[serde(default)]
    pub auto_migrate: bool,
}

impl Default for PostgresConfig {
    fn default() -> Self {
        Self {
            url: default_url(),
            max_connections: default_max_connections(),
            auto_migrate: false,
        }
    }
}

impl PostgresConfig {
    pub fn for_development() -> Self {
        Self {
            url: default_url(),
            max_connections: 5,
            auto_migrate: true,
        }
    }

    pub fn for_production(url: impl Into<String>) -> Self {
        Self {
            url: url.into(),
            max_connections: 20,
            auto_migrate: false,
        }
    }
}

fn default_url() -> String {
    "postgres://postgres:postgres@localhost/decacan".to_string()
}

fn default_max_connections() -> u32 {
    10
}
