use super::config::{LoggingConfig, RotationConfig};
use std::io;
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use tracing_subscriber::fmt::Layer;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

/// Initialize logging system
pub fn init_logging(config: &LoggingConfig) -> Result<(), LoggingInitError> {
    let env_filter =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(&config.level));

    // Build base subscriber
    let subscriber = tracing_subscriber::registry().with(env_filter);

    // Add stdout layer conditionally
    if config.stdout {
        let stdout_layer = Layer::new().with_writer(io::stdout).with_ansi(true).json();
        let subscriber = subscriber.with(stdout_layer);

        // Add file layer
        if config.file.enabled {
            let rotation = match config.file.rotation {
                RotationConfig::Minutely => Rotation::MINUTELY,
                RotationConfig::Hourly => Rotation::HOURLY,
                RotationConfig::Daily => Rotation::DAILY,
                RotationConfig::Never => Rotation::NEVER,
            };

            let file_appender = RollingFileAppender::new(rotation, "logs", "decacan.log");
            let file_layer = Layer::new().with_writer(file_appender).json();

            subscriber.with(file_layer).try_init()?;
        } else {
            subscriber.try_init()?;
        }
    } else {
        // Add file layer only
        if config.file.enabled {
            let rotation = match config.file.rotation {
                RotationConfig::Minutely => Rotation::MINUTELY,
                RotationConfig::Hourly => Rotation::HOURLY,
                RotationConfig::Daily => Rotation::DAILY,
                RotationConfig::Never => Rotation::NEVER,
            };

            let file_appender = RollingFileAppender::new(rotation, "logs", "decacan.log");
            let file_layer = Layer::new().with_writer(file_appender).json();

            subscriber.with(file_layer).try_init()?;
        } else {
            subscriber.try_init()?;
        }
    }

    Ok(())
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LoggingInitError {
    AlreadyInitialized,
    IoError(String),
}

impl std::fmt::Display for LoggingInitError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LoggingInitError::AlreadyInitialized => {
                write!(f, "Logging subscriber already initialized")
            }
            LoggingInitError::IoError(msg) => write!(f, "IO error: {}", msg),
        }
    }
}

impl std::error::Error for LoggingInitError {}

impl From<std::io::Error> for LoggingInitError {
    fn from(err: std::io::Error) -> Self {
        LoggingInitError::IoError(err.to_string())
    }
}

impl From<tracing_subscriber::util::TryInitError> for LoggingInitError {
    fn from(_: tracing_subscriber::util::TryInitError) -> Self {
        LoggingInitError::AlreadyInitialized
    }
}
