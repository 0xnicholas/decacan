use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct LoggingConfig {
    #[serde(default = "default_level")]
    pub level: String,
    #[serde(default = "default_stdout")]
    pub stdout: bool,
    #[serde(default)]
    pub file: FileConfig,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct FileConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default = "default_file_path")]
    pub path: String,
    #[serde(default = "default_rotation")]
    pub rotation: RotationConfig,
    #[serde(default = "default_max_files")]
    pub max_files: usize,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum RotationConfig {
    Minutely,
    Hourly,
    Daily,
    Never,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: default_level(),
            stdout: default_stdout(),
            file: FileConfig::default(),
        }
    }
}

impl Default for FileConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            path: default_file_path(),
            rotation: default_rotation(),
            max_files: default_max_files(),
        }
    }
}

fn default_level() -> String {
    "info".to_string()
}

fn default_stdout() -> bool {
    true
}

fn default_file_path() -> String {
    "logs/decacan.log".to_string()
}

fn default_rotation() -> RotationConfig {
    RotationConfig::Daily
}

fn default_max_files() -> usize {
    7
}
