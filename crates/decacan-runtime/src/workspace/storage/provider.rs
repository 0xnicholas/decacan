use std::fmt;
use std::io;

/// Errors that can occur during storage operations
#[derive(Debug)]
pub enum StorageError {
    /// Path contains .. or attempts to escape root directory
    PathNotAllowed(String),

    /// File or directory not found
    NotFound(String),

    /// IO error occurred
    Io(io::Error),

    /// Permission denied
    PermissionDenied(String),

    /// Path is a directory when a file was expected
    IsDirectory(String),

    /// Path is a file when a directory was expected
    IsFile(String),

    /// Invalid path format
    InvalidPath(String),
}

impl fmt::Display for StorageError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            StorageError::PathNotAllowed(path) => {
                write!(f, "Path not allowed (path traversal detected): {}", path)
            }
            StorageError::NotFound(path) => write!(f, "Not found: {}", path),
            StorageError::Io(err) => write!(f, "IO error: {}", err),
            StorageError::PermissionDenied(path) => {
                write!(f, "Permission denied: {}", path)
            }
            StorageError::IsDirectory(path) => write!(f, "Is a directory: {}", path),
            StorageError::IsFile(path) => write!(f, "Is a file: {}", path),
            StorageError::InvalidPath(path) => write!(f, "Invalid path: {}", path),
        }
    }
}

impl std::error::Error for StorageError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            StorageError::Io(err) => Some(err),
            _ => None,
        }
    }
}

impl From<io::Error> for StorageError {
    fn from(err: io::Error) -> Self {
        StorageError::Io(err)
    }
}

/// Entry in a directory listing
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DirectoryEntry {
    /// A file entry with its name and size in bytes
    File { name: String, size: u64 },
    /// A directory entry with its name
    Directory { name: String },
}

impl DirectoryEntry {
    /// Get the name of the entry
    pub fn name(&self) -> &str {
        match self {
            DirectoryEntry::File { name, .. } => name,
            DirectoryEntry::Directory { name } => name,
        }
    }

    /// Check if this entry is a file
    pub fn is_file(&self) -> bool {
        matches!(self, DirectoryEntry::File { .. })
    }

    /// Check if this entry is a directory
    pub fn is_directory(&self) -> bool {
        matches!(self, DirectoryEntry::Directory { .. })
    }
}

/// Trait for storage providers
pub trait StorageProvider: Send + Sync {
    /// Read the contents of a file
    ///
    /// # Arguments
    /// * `path` - The path to the file, relative to the storage root
    ///
    /// # Returns
    /// * `Ok(Vec<u8>)` - The file contents
    /// * `Err(StorageError::PathNotAllowed)` - If path contains .. or is absolute
    /// * `Err(StorageError::NotFound)` - If the file doesn't exist
    /// * `Err(StorageError::Io)` - If an IO error occurs
    fn read_file(&self, path: &str) -> Result<Vec<u8>, StorageError>;

    /// Write contents to a file
    ///
    /// Creates parent directories if they don't exist.
    /// Overwrites existing files.
    ///
    /// # Arguments
    /// * `path` - The path to the file, relative to the storage root
    /// * `content` - The content to write
    ///
    /// # Returns
    /// * `Ok(())` - Success
    /// * `Err(StorageError::PathNotAllowed)` - If path contains .. or is absolute
    /// * `Err(StorageError::Io)` - If an IO error occurs
    fn write_file(&self, path: &str, content: &[u8]) -> Result<(), StorageError>;

    /// Delete a file
    ///
    /// # Arguments
    /// * `path` - The path to the file, relative to the storage root
    ///
    /// # Returns
    /// * `Ok(())` - Success (even if file doesn't exist)
    /// * `Err(StorageError::PathNotAllowed)` - If path contains .. or is absolute
    /// * `Err(StorageError::IsDirectory)` - If the path is a directory
    /// * `Err(StorageError::Io)` - If an IO error occurs
    fn delete_file(&self, path: &str) -> Result<(), StorageError>;

    /// Check if a path exists
    ///
    /// # Arguments
    /// * `path` - The path to check, relative to the storage root
    ///
    /// # Returns
    /// * `Ok(true)` - If the path exists
    /// * `Ok(false)` - If the path doesn't exist
    /// * `Err(StorageError::PathNotAllowed)` - If path contains .. or is absolute
    fn exists(&self, path: &str) -> Result<bool, StorageError>;

    /// List the contents of a directory
    ///
    /// # Arguments
    /// * `path` - The path to the directory, relative to the storage root
    ///
    /// # Returns
    /// * `Ok(Vec<DirectoryEntry>)` - The directory entries
    /// * `Err(StorageError::PathNotAllowed)` - If path contains .. or is absolute
    /// * `Err(StorageError::NotFound)` - If the directory doesn't exist
    /// * `Err(StorageError::NotADirectory)` - If the path is not a directory
    /// * `Err(StorageError::Io)` - If an IO error occurs
    fn list_directory(&self, path: &str) -> Result<Vec<DirectoryEntry>, StorageError>;

    /// Create a directory and all parent directories
    ///
    /// # Arguments
    /// * `path` - The path to the directory, relative to the storage root
    ///
    /// # Returns
    /// * `Ok(())` - Success
    /// * `Err(StorageError::PathNotAllowed)` - If path contains .. or is absolute
    /// * `Err(StorageError::Io)` - If an IO error occurs
    fn create_directory(&self, path: &str) -> Result<(), StorageError>;
}

/// Validate that a path is safe (no .., not absolute)
///
/// This function checks for:
/// - Path traversal sequences (..)
/// - Absolute paths (starting with / or \ or containing drive letters on Windows)
///
/// Returns the normalized path if safe, or an error if unsafe.
pub fn validate_and_normalize_path(path: &str) -> Result<String, StorageError> {
    if path.is_empty() {
        return Ok(".".to_string());
    }

    // Check for absolute paths
    if path.starts_with('/') || path.starts_with('\\') {
        return Err(StorageError::PathNotAllowed(path.to_string()));
    }

    // Check for Windows absolute paths (e.g., C:\ or C:/)
    #[cfg(windows)]
    {
        if path.len() >= 2 && path.chars().nth(1) == Some(':') {
            return Err(StorageError::PathNotAllowed(path.to_string()));
        }
    }

    // Split the path into components and validate
    let components: Vec<&str> = path.split(['/', '\\']).collect();
    let mut normalized: Vec<String> = Vec::new();

    for component in components {
        if component.is_empty() || component == "." {
            // Skip empty components (from leading/trailing slashes) and current dir
            continue;
        }

        if component == ".." {
            // Path traversal detected - reject entire path
            return Err(StorageError::PathNotAllowed(path.to_string()));
        }

        normalized.push(component.to_string());
    }

    let result = if normalized.is_empty() {
        ".".to_string()
    } else {
        normalized.join("/")
    };

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_and_normalize_empty() {
        assert_eq!(validate_and_normalize_path("").unwrap(), ".");
    }

    #[test]
    fn test_validate_and_normalize_dot() {
        assert_eq!(validate_and_normalize_path(".").unwrap(), ".");
    }

    #[test]
    fn test_validate_and_normalize_simple() {
        assert_eq!(validate_and_normalize_path("file.txt").unwrap(), "file.txt");
    }

    #[test]
    fn test_validate_and_normalize_nested() {
        assert_eq!(
            validate_and_normalize_path("dir/subdir/file.txt").unwrap(),
            "dir/subdir/file.txt"
        );
    }

    #[test]
    fn test_validate_and_normalize_backslashes() {
        assert_eq!(
            validate_and_normalize_path("dir\\subdir\\file.txt").unwrap(),
            "dir/subdir/file.txt"
        );
    }

    #[test]
    fn test_validate_and_normalize_traversal() {
        assert!(validate_and_normalize_path("..").is_err());
        assert!(validate_and_normalize_path("../file").is_err());
        assert!(validate_and_normalize_path("dir/../..").is_err());
        assert!(validate_and_normalize_path("dir/../../../etc/passwd").is_err());
    }

    #[test]
    fn test_validate_and_normalize_leading_dot_slash() {
        assert_eq!(
            validate_and_normalize_path("./file.txt").unwrap(),
            "file.txt"
        );
    }

    #[test]
    fn test_validate_and_normalize_trailing_slash() {
        assert_eq!(validate_and_normalize_path("dir/").unwrap(), "dir");
    }

    #[test]
    fn test_validate_and_normalize_absolute_unix() {
        assert!(validate_and_normalize_path("/etc/passwd").is_err());
        assert!(validate_and_normalize_path("/home/user/file").is_err());
    }

    #[test]
    fn test_validate_and_normalize_absolute_windows() {
        assert!(validate_and_normalize_path("\\Windows\\System32").is_err());
    }

    #[cfg(windows)]
    #[test]
    fn test_validate_and_normalize_windows_drive() {
        assert!(validate_and_normalize_path("C:\\Windows").is_err());
        assert!(validate_and_normalize_path("C:/Windows").is_err());
        assert!(validate_and_normalize_path("D:\\file.txt").is_err());
    }

    #[test]
    fn test_directory_entry_name() {
        let file = DirectoryEntry::File {
            name: "test.txt".to_string(),
            size: 100,
        };
        assert_eq!(file.name(), "test.txt");
        assert!(file.is_file());
        assert!(!file.is_directory());

        let dir = DirectoryEntry::Directory {
            name: "mydir".to_string(),
        };
        assert_eq!(dir.name(), "mydir");
        assert!(dir.is_directory());
        assert!(!dir.is_file());
    }

    #[test]
    fn test_storage_error_display() {
        let err = StorageError::PathNotAllowed("../secret".to_string());
        assert!(err.to_string().contains("Path not allowed"));

        let err = StorageError::NotFound("file.txt".to_string());
        assert!(err.to_string().contains("Not found"));

        let err = StorageError::PermissionDenied("/root".to_string());
        assert!(err.to_string().contains("Permission denied"));

        let err = StorageError::IsDirectory("dir".to_string());
        assert!(err.to_string().contains("Is a directory"));

        let err = StorageError::IsFile("file".to_string());
        assert!(err.to_string().contains("Is a file"));

        let err = StorageError::InvalidPath("bad".to_string());
        assert!(err.to_string().contains("Invalid path"));
    }

    #[test]
    fn test_storage_error_from_io() {
        let io_err = io::Error::new(io::ErrorKind::NotFound, "test");
        let storage_err: StorageError = io_err.into();
        assert!(matches!(storage_err, StorageError::Io(_)));
    }
}
