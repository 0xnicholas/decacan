use std::fs;
use std::io;
use std::path::Path;

use decacan_runtime::ports::filesystem::FilesystemPort;

#[derive(Debug, Clone, Default)]
pub struct LocalFilesystem;

impl LocalFilesystem {
    pub fn new() -> Self {
        Self
    }
}

impl FilesystemPort for LocalFilesystem {
    type Error = io::Error;

    fn read_to_string(&self, path: &Path) -> Result<String, Self::Error> {
        fs::read_to_string(path)
    }

    fn write_string(&self, path: &Path, contents: &str) -> Result<(), Self::Error> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }

        fs::write(path, contents)
    }

    fn exists(&self, path: &Path) -> Result<bool, Self::Error> {
        Ok(path.exists())
    }
}
