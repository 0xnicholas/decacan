use std::collections::HashMap;
use std::convert::Infallible;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};

use time::OffsetDateTime;

use crate::playbook::registry::{
    get_registered_discovery_playbook_for_test, get_registered_summary_playbook_for_test,
};
use crate::policy::entity::PolicyProfile;
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::run::entity::Run;
use crate::run::service::{
    execute_discovery_playbook, execute_standard_summary_playbook, SummaryPlaybookE2eResult,
};
use crate::task::entity::Task;
use crate::workflow::compiler::{
    compile_discovery_playbook_for_test, compile_summary_playbook_for_test,
};
use crate::workspace::entity::Workspace;

pub(crate) fn execute_summary_playbook_e2e_for_test() -> SummaryPlaybookE2eResult {
    let filesystem = LocalFilesystemForTest;
    let storage = MemoryStorageForTest::new();
    let clock = FixedClockForTest::new(OffsetDateTime::now_utc());
    let workspace_root = unique_test_workspace_root("summary-playbook-e2e");
    let workspace = Workspace::new_for_test(
        "workspace-1",
        "workspace",
        workspace_root
            .to_str()
            .expect("workspace path should be valid utf-8"),
    );
    let playbook = get_registered_summary_playbook_for_test();
    let workflow = compile_summary_playbook_for_test();
    let policy = PolicyProfile::new_for_test("policy-1", &workspace.id, "default");
    let mut task = Task::new_for_test("task-1", &workspace.id, &playbook.id, workflow.version_id);
    let mut run = Run::new_for_test("run-1", &task.id, workflow, policy, workspace, playbook);

    filesystem
        .write_string(
            &workspace_root.join("notes.md"),
            "# Project Notes\nCurrent status: summary pipeline works.\nRisk: output contract is too weak.\nNext step: harden artifact structure.",
        )
        .expect("notes fixture should be written");
    filesystem
        .write_string(&workspace_root.join("output/summary.md"), "old summary")
        .expect("existing summary fixture should be written");

    let mut result =
        execute_standard_summary_playbook(&mut task, &mut run, &filesystem, &storage, &clock)
            .expect("summary playbook should execute");
    result.workspace_root = workspace_root;
    result
}

pub(crate) fn execute_discovery_playbook_e2e_for_test() -> SummaryPlaybookE2eResult {
    let filesystem = LocalFilesystemForTest;
    let storage = MemoryStorageForTest::new();
    let clock = FixedClockForTest::new(OffsetDateTime::now_utc());
    let workspace_root = unique_test_workspace_root("discovery-playbook-e2e");
    let workspace = Workspace::new_for_test(
        "workspace-1",
        "workspace",
        workspace_root
            .to_str()
            .expect("workspace path should be valid utf-8"),
    );
    let playbook = get_registered_discovery_playbook_for_test();
    let workflow = compile_discovery_playbook_for_test();
    let policy = PolicyProfile::new_for_test("policy-1", &workspace.id, "default");
    let mut task = Task::new_for_test("task-1", &workspace.id, &playbook.id, workflow.version_id);
    let mut run = Run::new_for_test("run-1", &task.id, workflow, policy, workspace, playbook);

    filesystem
        .write_string(
            &workspace_root.join("notes.md"),
            "# Release Notes\nMigration\nObservability\nBilling",
        )
        .expect("notes fixture should be written");

    let mut result = execute_discovery_playbook(&mut task, &mut run, &filesystem, &storage, &clock)
        .expect("discovery playbook should execute");
    result.workspace_root = workspace_root;
    result
}

#[derive(Debug, Clone, Default)]
struct MemoryStorageForTest {
    values: Arc<RwLock<HashMap<String, String>>>,
}

impl MemoryStorageForTest {
    fn new() -> Self {
        Self::default()
    }
}

impl StoragePort for MemoryStorageForTest {
    type Error = Infallible;

    fn put(&self, key: &str, value: &str) -> Result<(), Self::Error> {
        let mut values = self
            .values
            .write()
            .expect("memory storage lock should not be poisoned");
        values.insert(key.to_owned(), value.to_owned());
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let values = self
            .values
            .read()
            .expect("memory storage lock should not be poisoned");
        Ok(values.get(key).cloned())
    }
}

#[derive(Debug, Clone, Copy, Default)]
struct LocalFilesystemForTest;

impl FilesystemPort for LocalFilesystemForTest {
    type Error = std::io::Error;

    fn read_to_string(&self, path: &Path) -> Result<String, Self::Error> {
        std::fs::read_to_string(path)
    }

    fn write_string(&self, path: &Path, contents: &str) -> Result<(), Self::Error> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(path, contents)
    }

    fn exists(&self, path: &Path) -> Result<bool, Self::Error> {
        match std::fs::metadata(path) {
            Ok(_) => Ok(true),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(false),
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

fn collect_markdown_files(root: &Path, files: &mut Vec<PathBuf>) -> std::io::Result<()> {
    if !root.exists() {
        return Ok(());
    }

    for entry in std::fs::read_dir(root)? {
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

#[derive(Debug, Clone, Copy)]
struct FixedClockForTest {
    now: OffsetDateTime,
}

impl FixedClockForTest {
    fn new(now: OffsetDateTime) -> Self {
        Self { now }
    }
}

impl ClockPort for FixedClockForTest {
    fn now_utc(&self) -> OffsetDateTime {
        self.now
    }
}

fn unique_test_workspace_root(prefix: &str) -> PathBuf {
    let unique_suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_nanos();

    std::env::temp_dir().join(format!("{prefix}-{unique_suffix}"))
}
