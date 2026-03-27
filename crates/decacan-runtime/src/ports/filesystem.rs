use std::path::{Path, PathBuf};

pub trait FilesystemPort {
    type Error;

    fn read_to_string(&self, path: &Path) -> Result<String, Self::Error>;
    fn write_string(&self, path: &Path, contents: &str) -> Result<(), Self::Error>;
    fn exists(&self, path: &Path) -> Result<bool, Self::Error>;
    fn list_markdown_files(&self, root: &Path) -> Result<Vec<PathBuf>, Self::Error>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileWriteTarget {
    pub path: PathBuf,
    pub overwrite_existing: bool,
}

impl FileWriteTarget {
    pub fn new(path: impl Into<PathBuf>, overwrite_existing: bool) -> Self {
        Self {
            path: path.into(),
            overwrite_existing,
        }
    }
}
