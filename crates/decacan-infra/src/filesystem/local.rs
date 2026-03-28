use std::fs;
use std::io;
use std::path::{Path, PathBuf};

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
        match fs::metadata(path) {
            Ok(_) => Ok(true),
            Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(false),
            Err(error) => Err(error),
        }
    }

    fn list_markdown_files(&self, root: &Path) -> Result<Vec<PathBuf>, Self::Error> {
        let mut files = Vec::new();
        collect_markdown_files(root, &mut files)?;
        files.sort();
        Ok(files)
    }
}

fn collect_markdown_files(root: &Path, files: &mut Vec<PathBuf>) -> io::Result<()> {
    if !root.exists() {
        return Ok(());
    }

    for entry in fs::read_dir(root)? {
        let entry = entry?;
        let path = entry.path();
        let file_type = entry.file_type()?;

        if file_type.is_dir() {
            collect_markdown_files(&path, files)?;
        } else if path.extension().is_some_and(|extension| extension == "md") {
            files.push(path);
        }
    }

    Ok(())
}
