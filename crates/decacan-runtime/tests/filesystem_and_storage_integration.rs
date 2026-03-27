use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use decacan_infra::clock::system::SystemClock;
use decacan_infra::filesystem::local::LocalFilesystem;
use decacan_infra::models::mock::MockModel;
use decacan_infra::models::openai_compatible::{
    OpenAiCompatibleModelPlaceholder, OpenAiCompatibleModelPlaceholderError,
};
use decacan_infra::storage::memory::MemoryStorage;
use decacan_infra::storage::sqlite::{SqliteStoragePlaceholder, SqliteStoragePlaceholderError};
use decacan_runtime::ports::clock::ClockPort;
use decacan_runtime::ports::filesystem::FilesystemPort;
use decacan_runtime::ports::model::ModelPort;
use decacan_runtime::ports::storage::StoragePort;

#[test]
fn local_fs_and_memory_storage_support_runtime_ports() {
    fn assert_filesystem<T: FilesystemPort>(_value: &T) {}
    fn assert_storage<T: StoragePort>(_value: &T) {}
    fn assert_model<T: ModelPort>(_value: &T) {}
    fn assert_clock<T: ClockPort>(_value: &T) {}

    let filesystem = LocalFilesystem::new();
    let storage = MemoryStorage::new();
    let model = MockModel::new("mock response");
    let clock = SystemClock::new();

    assert_filesystem(&filesystem);
    assert_storage(&storage);
    assert_model(&model);
    assert_clock(&clock);

    let test_root = unique_test_path("local-fs-and-memory-storage-support-runtime-ports");
    fs::create_dir_all(&test_root).expect("test root directory should be created");
    let file_path = test_root.join("runtime-smoke-test.txt");
    filesystem
        .write_string(&file_path, "runtime smoke test")
        .expect("local filesystem write should succeed");

    assert!(filesystem
        .exists(&file_path)
        .expect("local filesystem exists check should succeed"));
    assert_eq!(
        filesystem
            .read_to_string(&file_path)
            .expect("local filesystem read should succeed"),
        "runtime smoke test"
    );
    assert_eq!(
        filesystem
            .list_markdown_files(&test_root)
            .expect("markdown listing should succeed"),
        Vec::<PathBuf>::new()
    );

    storage
        .put("smoke-key", "smoke-value")
        .expect("memory storage put should succeed");
    assert_eq!(
        storage
            .get("smoke-key")
            .expect("memory storage get should succeed"),
        Some(String::from("smoke-value"))
    );

    assert_eq!(
        model
            .complete("ignored prompt")
            .expect("mock model completion should succeed"),
        "mock response"
    );

    let now = clock.now_utc();
    assert_eq!(now.offset().whole_seconds(), 0);

    fs::remove_dir_all(test_root).expect("test fixture cleanup should succeed");
}

#[test]
fn local_filesystem_exists_returns_false_for_missing_paths() {
    let filesystem = LocalFilesystem::new();
    let missing_path = unique_test_path("missing-path.txt");

    assert_eq!(
        filesystem
            .exists(&missing_path)
            .expect("missing paths should not be treated as errors"),
        false
    );
}

#[test]
fn local_filesystem_exists_propagates_non_not_found_errors() {
    let filesystem = LocalFilesystem::new();
    let parent_file = unique_test_path("not-a-directory");
    let child_path = parent_file.join("child.txt");

    fs::write(&parent_file, "not a directory")
        .expect("test fixture file should be written successfully");

    let error = filesystem
        .exists(&child_path)
        .expect_err("non-NotFound filesystem errors should be propagated");

    assert_ne!(error.kind(), std::io::ErrorKind::NotFound);
    assert!(matches!(
        error.kind(),
        std::io::ErrorKind::NotADirectory | std::io::ErrorKind::PermissionDenied
    ));

    fs::remove_file(parent_file).expect("test fixture cleanup should succeed");
}

#[test]
fn placeholder_adapters_fail_explicitly_when_used() {
    let model = OpenAiCompatibleModelPlaceholder::new(
        "OpenAI-compatible adapter is declared but not implemented in Task 8",
    );
    let storage =
        SqliteStoragePlaceholder::new("SQLite adapter is declared but not implemented in Task 8");

    assert_eq!(
        model.complete("prompt"),
        Err(OpenAiCompatibleModelPlaceholderError::Placeholder(
            "OpenAI-compatible adapter is declared but not implemented in Task 8".to_string()
        ))
    );
    assert_eq!(
        storage.put("key", "value"),
        Err(SqliteStoragePlaceholderError::Placeholder(
            "SQLite adapter is declared but not implemented in Task 8".to_string()
        ))
    );
}

fn unique_test_path(file_name: &str) -> PathBuf {
    let unique_suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_nanos();

    std::env::temp_dir().join(format!("{unique_suffix}-{file_name}"))
}
