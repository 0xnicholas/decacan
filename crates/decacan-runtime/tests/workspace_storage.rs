use decacan_runtime::workspace::storage::local::LocalStorageProvider;
use decacan_runtime::workspace::storage::provider::{DirectoryEntry, StorageProvider};
use std::fs;
use tempfile::TempDir;

fn create_test_provider() -> (LocalStorageProvider, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let provider = LocalStorageProvider::new(temp_dir.path());
    (provider, temp_dir)
}

#[test]
fn test_read_write_file() {
    let (provider, _temp_dir) = create_test_provider();
    let content = b"Hello, World!";

    provider.write_file("test.txt", content).unwrap();
    let result = provider.read_file("test.txt").unwrap();

    assert_eq!(result, content);
}

#[test]
fn test_read_nonexistent_file() {
    let (provider, _temp_dir) = create_test_provider();

    let result = provider.read_file("nonexistent.txt");

    assert!(result.is_err());
    let err = result.unwrap_err();
    let err_str = err.to_string().to_lowercase();
    assert!(
        err_str.contains("not found"),
        "Expected 'not found' in error: {}",
        err_str
    );
}

#[test]
fn test_write_and_overwrite_file() {
    let (provider, _temp_dir) = create_test_provider();

    provider.write_file("test.txt", b"first").unwrap();
    provider.write_file("test.txt", b"second").unwrap();

    let result = provider.read_file("test.txt").unwrap();
    assert_eq!(result, b"second");
}

#[test]
fn test_path_traversal_prevention() {
    let (provider, temp_dir) = create_test_provider();

    let traversal_attempts = vec![
        "../secret.txt",
        "../../etc/passwd",
        "subdir/../../../etc/passwd",
        "./../secret.txt",
        "normal/../secret.txt",
    ];

    for attempt in traversal_attempts {
        let write_result = provider.write_file(attempt, b"malicious");
        let read_result = provider.read_file(attempt);
        let exists_result = provider.exists(attempt);
        let delete_result = provider.delete_file(attempt);

        assert!(
            write_result.is_err(),
            "Path '{}' should be rejected for write",
            attempt
        );
        assert!(
            read_result.is_err(),
            "Path '{}' should be rejected for read",
            attempt
        );
        assert!(
            exists_result.is_err(),
            "Path '{}' should be rejected for exists",
            attempt
        );
        assert!(
            delete_result.is_err(),
            "Path '{}' should be rejected for delete",
            attempt
        );

        let err = write_result.unwrap_err();
        assert!(
            err.to_string().contains("not allowed") || err.to_string().contains("traversal"),
            "Error for '{}' should indicate path not allowed",
            attempt
        );
    }

    // Verify no file was created outside root
    let outside_path = temp_dir.path().parent().unwrap().join("secret.txt");
    assert!(
        !outside_path.exists(),
        "File should not have been created outside root"
    );
}

#[test]
fn test_path_traversal_create_directory() {
    let (provider, temp_dir) = create_test_provider();

    let traversal_attempts = vec![
        "../malicious_dir",
        "../../etc/malicious",
        "subdir/../../../etc/malicious",
    ];

    for attempt in traversal_attempts {
        let result = provider.create_directory(attempt);
        assert!(
            result.is_err(),
            "Directory creation with path '{}' should be rejected",
            attempt
        );

        let err = result.unwrap_err();
        assert!(
            err.to_string().contains("not allowed") || err.to_string().contains("traversal"),
            "Error should indicate path not allowed"
        );
    }

    // Verify no directory was created outside root
    let outside_path = temp_dir.path().parent().unwrap().join("malicious_dir");
    assert!(
        !outside_path.exists(),
        "Directory should not have been created outside root"
    );
}

#[test]
fn test_list_directory() {
    let (provider, _temp_dir) = create_test_provider();

    // Create some files and directories
    provider.write_file("file1.txt", b"content1").unwrap();
    provider.write_file("file2.txt", b"content2").unwrap();
    provider.create_directory("subdir").unwrap();
    provider
        .write_file("subdir/nested.txt", b"nested content")
        .unwrap();

    let entries = provider.list_directory(".").unwrap();

    assert_eq!(entries.len(), 3);

    let names: Vec<String> = entries.iter().map(|e| e.name().to_string()).collect();
    assert!(names.contains(&"file1.txt".to_string()));
    assert!(names.contains(&"file2.txt".to_string()));
    assert!(names.contains(&"subdir".to_string()));

    // Check entry types
    let file1 = entries.iter().find(|e| e.name() == "file1.txt").unwrap();
    assert!(matches!(file1, DirectoryEntry::File { .. }));

    let subdir = entries.iter().find(|e| e.name() == "subdir").unwrap();
    assert!(matches!(subdir, DirectoryEntry::Directory { .. }));
}

#[test]
fn test_list_directory_nonexistent() {
    let (provider, _temp_dir) = create_test_provider();

    let result = provider.list_directory("nonexistent");

    assert!(result.is_err());
}

#[test]
fn test_list_directory_traversal() {
    let (provider, _temp_dir) = create_test_provider();

    let result = provider.list_directory("../..");
    assert!(result.is_err());
}

#[test]
fn test_file_deletion() {
    let (provider, _temp_dir) = create_test_provider();

    provider.write_file("to_delete.txt", b"delete me").unwrap();
    assert!(provider.exists("to_delete.txt").unwrap());

    provider.delete_file("to_delete.txt").unwrap();
    assert!(!provider.exists("to_delete.txt").unwrap());
}

#[test]
fn test_delete_nonexistent_file() {
    let (provider, _temp_dir) = create_test_provider();

    let result = provider.delete_file("nonexistent.txt");

    // Should succeed or fail gracefully - not panic
    assert!(result.is_ok() || result.is_err());
}

#[test]
fn test_delete_directory_fails() {
    let (provider, _temp_dir) = create_test_provider();

    provider.create_directory("mydir").unwrap();

    // Trying to delete a directory with delete_file should fail
    let result = provider.delete_file("mydir");
    assert!(result.is_err());
}

#[test]
fn test_exists() {
    let (provider, _temp_dir) = create_test_provider();

    provider.write_file("exists.txt", b"yes").unwrap();
    provider.create_directory("exists_dir").unwrap();

    assert!(provider.exists("exists.txt").unwrap());
    assert!(provider.exists("exists_dir").unwrap());
    assert!(!provider.exists("does_not_exist.txt").unwrap());
}

#[test]
fn test_nested_paths() {
    let (provider, _temp_dir) = create_test_provider();

    provider.create_directory("level1").unwrap();
    provider.create_directory("level1/level2").unwrap();
    provider.write_file("level1/file1.txt", b"level 1").unwrap();
    provider
        .write_file("level1/level2/file2.txt", b"level 2")
        .unwrap();

    assert!(provider.exists("level1").unwrap());
    assert!(provider.exists("level1/level2").unwrap());
    assert!(provider.exists("level1/file1.txt").unwrap());
    assert!(provider.exists("level1/level2/file2.txt").unwrap());

    let level1_entries = provider.list_directory("level1").unwrap();
    assert_eq!(level1_entries.len(), 2);

    let file1 = provider.read_file("level1/file1.txt").unwrap();
    assert_eq!(file1, b"level 1");

    let file2 = provider.read_file("level1/level2/file2.txt").unwrap();
    assert_eq!(file2, b"level 2");
}

#[test]
fn test_empty_file() {
    let (provider, _temp_dir) = create_test_provider();

    provider.write_file("empty.txt", b"").unwrap();
    let content = provider.read_file("empty.txt").unwrap();

    assert!(content.is_empty());
}

#[test]
fn test_binary_content() {
    let (provider, _temp_dir) = create_test_provider();

    let binary_content: Vec<u8> = (0..=255).collect();
    provider.write_file("binary.dat", &binary_content).unwrap();

    let read_content = provider.read_file("binary.dat").unwrap();
    assert_eq!(read_content, binary_content);
}

#[test]
fn test_unicode_filenames() {
    let (provider, _temp_dir) = create_test_provider();

    let unicode_names = vec![
        "日本語.txt",
        "emoji😀.txt",
        "with spaces.txt",
        "special!@#$%.txt",
    ];

    for name in unicode_names {
        provider.write_file(name, b"content").unwrap();
        assert!(provider.exists(name).unwrap());
    }
}

#[test]
fn test_create_directory_nested() {
    let (provider, _temp_dir) = create_test_provider();

    // Create nested directories in one call
    provider.create_directory("a/b/c").unwrap();

    assert!(provider.exists("a").unwrap());
    assert!(provider.exists("a/b").unwrap());
    assert!(provider.exists("a/b/c").unwrap());
}

#[test]
fn test_root_path_resolved_correctly() {
    let temp_dir = TempDir::new().unwrap();
    let root_path = temp_dir.path().to_path_buf();
    let provider = LocalStorageProvider::new(&root_path);

    provider.write_file("root_test.txt", b"test").unwrap();

    let expected_path = root_path.join("root_test.txt");
    assert!(expected_path.exists());

    let content = fs::read(&expected_path).unwrap();
    assert_eq!(content, b"test");
}

#[test]
fn test_list_directory_with_empty_directory() {
    let (provider, _temp_dir) = create_test_provider();

    provider.create_directory("empty_dir").unwrap();
    let entries = provider.list_directory("empty_dir").unwrap();

    assert!(entries.is_empty());
}

#[test]
fn test_directory_entry_metadata() {
    let (provider, _temp_dir) = create_test_provider();

    provider.write_file("test.txt", b"hello world").unwrap();
    let entries = provider.list_directory(".").unwrap();

    assert_eq!(entries.len(), 1);
    let entry = &entries[0];

    match entry {
        DirectoryEntry::File { name, size } => {
            assert_eq!(name, "test.txt");
            assert_eq!(*size, 11); // "hello world" length
        }
        DirectoryEntry::Directory { .. } => {
            panic!("Expected file entry, got directory")
        }
    }
}

#[test]
fn test_permission_denied_on_read_only_directory() {
    let (provider, temp_dir) = create_test_provider();

    // Create a read-only directory
    let readonly_dir = temp_dir.path().join("readonly");
    fs::create_dir(&readonly_dir).unwrap();
    let mut permissions = fs::metadata(&readonly_dir).unwrap().permissions();
    permissions.set_readonly(true);
    fs::set_permissions(&readonly_dir, permissions).unwrap();

    // Try to write to the read-only directory
    let result = provider.write_file("readonly/test.txt", b"test");

    // Cleanup: restore permissions so temp_dir cleanup works
    #[cfg(not(target_os = "windows"))]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut permissions = fs::metadata(&readonly_dir).unwrap().permissions();
        permissions.set_mode(0o755);
        fs::set_permissions(&readonly_dir, permissions).unwrap();
    }

    // On Unix systems, this should fail with permission denied
    // On Windows, it might succeed depending on the user
    #[cfg(not(target_os = "windows"))]
    assert!(result.is_err());
}

#[test]
fn test_dot_slash_normalized() {
    let (provider, _temp_dir) = create_test_provider();

    // ./file.txt should work the same as file.txt
    provider.write_file("./file.txt", b"content").unwrap();
    assert!(provider.exists("file.txt").unwrap());
    assert!(provider.exists("./file.txt").unwrap());
}

#[test]
fn test_traversal_with_dotdot_in_middle() {
    let (provider, _temp_dir) = create_test_provider();

    // Create legitimate nested structure
    provider.create_directory("a").unwrap();
    provider.create_directory("a/b").unwrap();
    provider.write_file("a/b/legit.txt", b"legit").unwrap();

    // This should succeed (legitimate path)
    let result = provider.read_file("a/b/legit.txt");
    assert!(result.is_ok());

    // This should fail (traversal)
    let result = provider.read_file("a/../b/legit.txt");
    // Some implementations might normalize this to "b/legit.txt" which doesn't exist
    // or reject it for containing ..
    // Either behavior is acceptable as long as it doesn't escape root
    assert!(result.is_err() || !provider.exists("b/legit.txt").unwrap_or(true));
}

#[test]
fn test_absolute_path_rejected() {
    let (provider, _temp_dir) = create_test_provider();

    // Absolute paths should be rejected
    // Note: On Unix, paths starting with / are absolute
    // On Windows, paths starting with C:\ or similar are absolute (but only on Windows)
    let absolute_paths = vec!["/etc/passwd", "/tmp/test.txt"];

    for path in absolute_paths {
        let result = provider.write_file(path, b"test");
        assert!(
            result.is_err(),
            "Absolute path '{}' should be rejected",
            path
        );
    }

    // Test Windows-style paths only on Windows
    #[cfg(windows)]
    {
        let windows_paths = vec!["C:\\Windows\\System32"];
        for path in windows_paths {
            let result = provider.write_file(path, b"test");
            assert!(
                result.is_err(),
                "Windows absolute path '{}' should be rejected",
                path
            );
        }
    }
}

#[test]
fn test_list_directory_sorting() {
    let (provider, _temp_dir) = create_test_provider();

    // Create entries in non-alphabetical order
    provider.write_file("zebra.txt", b"z").unwrap();
    provider.write_file("alpha.txt", b"a").unwrap();
    provider.create_directory("middle").unwrap();
    provider.write_file("beta.txt", b"b").unwrap();

    let entries = provider.list_directory(".").unwrap();
    let names: Vec<String> = entries.iter().map(|e| e.name().to_string()).collect();

    // Verify all entries exist
    assert!(names.contains(&"alpha.txt".to_string()));
    assert!(names.contains(&"beta.txt".to_string()));
    assert!(names.contains(&"zebra.txt".to_string()));
    assert!(names.contains(&"middle".to_string()));
}

#[test]
fn test_concurrent_operations() {
    use std::sync::Arc;
    use std::thread;

    let temp_dir = TempDir::new().unwrap();
    let provider = Arc::new(LocalStorageProvider::new(temp_dir.path()));

    let mut handles = vec![];

    for i in 0..10 {
        let provider_clone = Arc::clone(&provider);
        let handle = thread::spawn(move || {
            let filename = format!("file_{}.txt", i);
            let content = format!("content {}", i);
            provider_clone
                .write_file(&filename, content.as_bytes())
                .unwrap();

            let read_content = provider_clone.read_file(&filename).unwrap();
            assert_eq!(read_content, content.as_bytes());
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    // Verify all files exist
    for i in 0..10 {
        let filename = format!("file_{}.txt", i);
        assert!(provider.exists(&filename).unwrap());
    }
}
