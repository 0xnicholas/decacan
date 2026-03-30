use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StorageConfig {
    pub provider: StorageProvider,
    pub local_path: Option<String>,
    pub cloud_config: Option<CloudStorageConfig>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StorageProvider {
    Local,
    S3,
    Gcs,
    AzureBlob,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CloudStorageConfig {
    pub bucket: String,
    pub region: String,
}

impl StorageConfig {
    pub fn local(path: impl Into<String>) -> Self {
        Self {
            provider: StorageProvider::Local,
            local_path: Some(path.into()),
            cloud_config: None,
        }
    }

    pub fn s3(bucket: impl Into<String>, region: impl Into<String>) -> Self {
        Self {
            provider: StorageProvider::S3,
            local_path: None,
            cloud_config: Some(CloudStorageConfig {
                bucket: bucket.into(),
                region: region.into(),
            }),
        }
    }
}

impl Default for StorageConfig {
    fn default() -> Self {
        Self::local("/data/workspaces")
    }
}
