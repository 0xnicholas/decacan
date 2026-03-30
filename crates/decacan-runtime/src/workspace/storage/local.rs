use super::provider::{validate_and_normalize_path, DirectoryEntry, StorageError, StorageProvider};
use std::fs;
use std::path::{Path, PathBuf};

/// A local filesystem storage provider
///
/// All operations are restricted to a root directory. Path traversal attempts
/// (using ..) are rejected to prevent access outside the root.
#[derive(Debug, Clone)]
pub struct LocalStorageProvider {
    root: PathBuf,
}

impl LocalStorageProvider {
    /// Create a new LocalStorageProvider with the given root directory
    ///
    /// # Arguments
    /// * `root` - The root directory for all storage operations
    ///
    /// # Panics
    /// Panics if the root directory cannot be canonicalized
    pub fn new(root: &Path) -> Self {
        let root = root.canonicalize().unwrap_or_else(|_| root.to_path_buf());
        Self { root }
    }

    /// Resolve a user-provided path to an absolute path within root
    ///
    /// Returns an error if the path contains .. (path traversal) or is absolute.
    fn resolve_path(&self, path: &str) -> Result<PathBuf, StorageError> {
        let normalized = validate_and_normalize_path(path)?;

        let resolved = if normalized == "." {
            self.root.clone()
        } else {
            self.root.join(&normalized)
        };

        // Security check: ensure resolved path is within root
        let canonical_resolved = resolved.canonicalize().unwrap_or(resolved.clone());
        let canonical_root = self
            .root
            .canonicalize()
            .unwrap_or_else(|_| self.root.clone());

        if !canonical_resolved.starts_with(&canonical_root) {
            return Err(StorageError::PathNotAllowed(path.to_string()));
        }

        Ok(resolved)
    }

    /// Create parent directories for a file path
    fn ensure_parent_dirs(&self, path: &Path) -> Result<(), StorageError> {
        if let Some(parent) = path.parent() {
            if parent != self.root && !parent.starts_with(&self.root) {
                // Parent is outside root - this shouldn't happen due to resolve_path
                return Err(StorageError::PathNotAllowed(
                    path.to_string_lossy().to_string(),
                ));
            }
            fs::create_dir_all(parent)?;
        }
        Ok(())
    }
}

impl StorageProvider for LocalStorageProvider {
    fn read_file(&self, path: &str) -> Result<Vec<u8>, StorageError> {
        let resolved = self.resolve_path(path)?;

        if !resolved.exists() {
            return Err(StorageError::NotFound(path.to_string()));
        }

        if resolved.is_dir() {
            return Err(StorageError::IsDirectory(path.to_string()));
        }

        let content = fs::read(&resolved)?;
        Ok(content)
    }

    fn write_file(&self, path: &str, content: &[u8]) -> Result<(), StorageError> {
        let resolved = self.resolve_path(path)?;

        // Create parent directories if needed
        self.ensure_parent_dirs(&resolved)?;

        fs::write(&resolved, content)?;
        Ok(())
    }

    fn delete_file(&self, path: &str) -> Result<(), StorageError> {
        let resolved = self.resolve_path(path)?;

        if !resolved.exists() {
            // File doesn't exist - consider this success
            return Ok(());
        }

        if resolved.is_dir() {
            return Err(StorageError::IsDirectory(path.to_string()));
        }

        fs::remove_file(&resolved)?;
        Ok(())
    }

    fn exists(&self, path: &str) -> Result<bool, StorageError> {
        let resolved = self.resolve_path(path)?;
        Ok(resolved.exists())
    }

    fn list_directory(&self, path: &str) -> Result<Vec<DirectoryEntry>, StorageError> {
        let resolved = self.resolve_path(path)?;

        if !resolved.exists() {
            return Err(StorageError::NotFound(path.to_string()));
        }

        if !resolved.is_dir() {
            return Err(StorageError::IsFile(path.to_string()));
        }

        let mut entries = Vec::new();

        for entry in fs::read_dir(&resolved)? {
            let entry = entry?;
            let metadata = entry.metadata()?;
            let name = entry.file_name().to_string_lossy().to_string();

            if metadata.is_file() {
                entries.push(DirectoryEntry::File {
                    name,
                    size: metadata.len(),
                });
            } else if metadata.is_dir() {
                entries.push(DirectoryEntry::Directory { name });
            }
            // Symlinks are ignored for security
        }

        Ok(entries)
    }

    fn create_directory(&self, path: &str) -> Result<(), StorageError> {
        let resolved = self.resolve_path(path)?;

        fs::create_dir_all(&resolved)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::TempDir;

    fn create_test_provider() -> (LocalStorageProvider, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let provider = LocalStorageProvider::new(temp_dir.path());
        (provider, temp_dir)
    }

    #[test]
    fn test_new_creates_provider() {
        let temp_dir = TempDir::new().unwrap();
        let provider = LocalStorageProvider::new(temp_dir.path());
        assert_eq!(provider.root, temp_dir.path().canonicalize().unwrap());
    }

    #[test]
    fn test_resolve_path_simple() {
        let (provider, temp_dir) = create_test_provider();
        let resolved = provider.resolve_path("file.txt").unwrap();
        let expected = temp_dir.path().canonicalize().unwrap().join("file.txt");
        assert_eq!(resolved, expected);
    }

    #[test]
    fn test_resolve_path_nested() {
        let (provider, temp_dir) = create_test_provider();
        let resolved = provider.resolve_path("dir/subdir/file.txt").unwrap();
        let expected = temp_dir
            .path()
            .canonicalize()
            .unwrap()
            .join("dir/subdir/file.txt");
        assert_eq!(resolved, expected);
    }

    #[test]
    fn test_resolve_path_traversal() {
        let (provider, _temp_dir) = create_test_provider();

        assert!(provider.resolve_path("..").is_err());
        assert!(provider.resolve_path("../secret").is_err());
        assert!(provider.resolve_path("dir/../../secret").is_err());
    }

    #[test]
    fn test_resolve_path_absolute() {
        let (provider, _temp_dir) = create_test_provider();

        assert!(provider.resolve_path("/etc/passwd").is_err());
        assert!(provider.resolve_path("\\Windows").is_err());
    }

    #[test]
    fn test_write_and_read() {
        let (provider, _temp_dir) = create_test_provider();

        provider.write_file("test.txt", b"hello").unwrap();
        let content = provider.read_file("test.txt").unwrap();

        assert_eq!(content, b"hello");
    }

    #[test]
    fn test_read_not_found() {
        let (provider, _temp_dir) = create_test_provider();

        let result = provider.read_file("nonexistent.txt");
        assert!(matches!(result, Err(StorageError::NotFound(_))));
    }

    #[test]
    fn test_write_creates_parents() {
        let (provider, _temp_dir) = create_test_provider();

        provider.write_file("a/b/c/file.txt", b"content").unwrap();
        let content = provider.read_file("a/b/c/file.txt").unwrap();

        assert_eq!(content, b"content");
    }

    #[test]
    fn test_exists() {
        let (provider, _temp_dir) = create_test_provider();

        assert!(!provider.exists("file.txt").unwrap());

        provider.write_file("file.txt", b"test").unwrap();
        assert!(provider.exists("file.txt").unwrap());
    }

    #[test]
    fn test_delete_file() {
        let (provider, _temp_dir) = create_test_provider();

        provider.write_file("to_delete.txt", b"delete me").unwrap();
        assert!(provider.exists("to_delete.txt").unwrap());

        provider.delete_file("to_delete.txt").unwrap();
        assert!(!provider.exists("to_delete.txt").unwrap());
    }

    #[test]
    fn test_delete_nonexistent_is_ok() {
        let (provider, _temp_dir) = create_test_provider();

        // Deleting a non-existent file should succeed (idempotent)
        provider.delete_file("nonexistent.txt").unwrap();
    }

    #[test]
    fn test_delete_directory_fails() {
        let (provider, _temp_dir) = create_test_provider();

        provider.create_directory("mydir").unwrap();

        let result = provider.delete_file("mydir");
        assert!(matches!(result, Err(StorageError::IsDirectory(_))));
    }

    #[test]
    fn test_create_directory() {
        let (provider, _temp_dir) = create_test_provider();

        provider.create_directory("newdir").unwrap();
        assert!(provider.exists("newdir").unwrap());
    }

    #[test]
    fn test_create_nested_directory() {
        let (provider, _temp_dir) = create_test_provider();

        provider.create_directory("a/b/c").unwrap();
        assert!(provider.exists("a").unwrap());
        assert!(provider.exists("a/b").unwrap());
        assert!(provider.exists("a/b/c").unwrap());
    }

    #[test]
    fn test_list_directory() {
        let (provider, _temp_dir) = create_test_provider();

        provider.write_file("file1.txt", b"a").unwrap();
        provider.write_file("file2.txt", b"bb").unwrap();
        provider.create_directory("subdir").unwrap();

        let entries = provider.list_directory(".").unwrap();

        assert_eq!(entries.len(), 3);

        let file_names: Vec<String> = entries
            .iter()
            .filter(|e| e.is_file())
            .map(|e| e.name().to_string())
            .collect();
        assert!(file_names.contains(&"file1.txt".to_string()));
        assert!(file_names.contains(&"file2.txt".to_string()));

        let dir_names: Vec<String> = entries
            .iter()
            .filter(|e| e.is_directory())
            .map(|e| e.name().to_string())
            .collect();
        assert!(dir_names.contains(&"subdir".to_string()));

        // Check file sizes
        let file1 = entries.iter().find(|e| e.name() == "file1.txt").unwrap();
        if let DirectoryEntry::File { size, .. } = file1 {
            assert_eq!(*size, 1);
        }

        let file2 = entries.iter().find(|e| e.name() == "file2.txt").unwrap();
        if let DirectoryEntry::File { size, .. } = file2 {
            assert_eq!(*size, 2);
        }
    }

    #[test]
    fn test_list_directory_not_found() {
        let (provider, _temp_dir) = create_test_provider();

        let result = provider.list_directory("nonexistent");
        assert!(matches!(result, Err(StorageError::NotFound(_))));
    }

    #[test]
    fn test_list_directory_is_file() {
        let (provider, _temp_dir) = create_test_provider();

        provider.write_file("file.txt", b"test").unwrap();

        let result = provider.list_directory("file.txt");
        assert!(matches!(result, Err(StorageError::IsFile(_))));
    }

    #[test]
    fn test_traversal_blocked_even_if_file_exists() {
        let (provider, temp_dir) = create_test_provider();

        // Create a file outside the root
        let outside_file = temp_dir.path().parent().unwrap().join("secret.txt");
        let mut file = fs::File::create(&outside_file).unwrap();
        file.write_all(b"secret").unwrap();
        drop(file);

        // Try to read it via traversal
        let result = provider.read_file("../secret.txt");
        assert!(result.is_err());

        // Clean up
        fs::remove_file(outside_file).unwrap();
    }

    #[test]
    fn test_traversal_with_complex_path() {
        let (provider, _temp_dir) = create_test_provider();

        // Create a legitimate nested structure
        provider.create_directory("level1").unwrap();
        provider.write_file("level1/file.txt", b"content").unwrap();

        // Try various traversal attempts
        let attempts = vec![
            "level1/../../../etc/passwd",
            "./../secret",
            "level1/../..",
            "a/b/../../../c",
        ];

        for attempt in attempts {
            let result = provider.resolve_path(attempt);
            assert!(result.is_err(), "Path '{}' should be rejected", attempt);
        }
    }
}
