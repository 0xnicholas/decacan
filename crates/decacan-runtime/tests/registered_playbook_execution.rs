use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

use decacan_infra::clock::system::SystemClock;
use decacan_infra::filesystem::local::LocalFilesystem;
use decacan_infra::storage::memory::MemoryStorage;
use decacan_runtime::playbook::execution::{
    execute_registered_playbook_run, prepare_registered_playbook_run, preview_registered_playbook,
    RegisteredPlaybookExecutionRequest,
};
use decacan_runtime::playbook::registry::{DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY};
use decacan_runtime::task::entity::TaskStatus;
use uuid::Uuid;

#[test]
fn preview_registered_summary_playbook_returns_runtime_plan_and_expected_artifact() {
    let preview = preview_registered_playbook(SUMMARY_PLAYBOOK_KEY)
        .expect("summary playbook should produce a preview");

    assert_eq!(preview.plan_steps.len(), 7);
    assert_eq!(
        preview.plan_steps[0],
        "Scan the workspace for markdown files that can be summarized."
    );
    assert_eq!(
        preview.plan_steps[6],
        "Register the written summary as the workflow output artifact."
    );
    assert_eq!(preview.expected_artifact_label, "Summary document");
    assert_eq!(preview.expected_artifact_path, "output/summary.md");
}

#[test]
fn prepare_registered_discovery_playbook_run_builds_runtime_task_run_and_pending_artifact() {
    let workspace_root = unique_test_workspace_root("prepare-discovery");
    let prepared = prepare_registered_playbook_run(RegisteredPlaybookExecutionRequest {
        task_id: "task-42".to_owned(),
        run_id: "run-42".to_owned(),
        workspace_id: "workspace-1".to_owned(),
        workspace_root: workspace_root.display().to_string(),
        playbook_key: DISCOVER_TOPICS_PLAYBOOK_KEY.to_owned(),
        playbook_version_id: Uuid::parse_str("88dd5ca4-8c76-4784-a7b0-5b4607d63b62")
            .expect("fixture uuid should be valid"),
    })
    .expect("discovery playbook should prepare");

    assert_eq!(prepared.task.id, "task-42");
    assert_eq!(prepared.run.id, "run-42");
    assert_eq!(
        prepared.task.playbook_version_id,
        Uuid::parse_str("88dd5ca4-8c76-4784-a7b0-5b4607d63b62")
            .expect("fixture uuid should be valid")
    );
    assert_eq!(
        prepared.run.playbook_snapshot.key,
        DISCOVER_TOPICS_PLAYBOOK_KEY
    );
    assert_eq!(prepared.run.workflow_snapshot.steps.len(), 6);
    assert_eq!(
        prepared.pending_artifact.id,
        "artifact-task-42-discovery-primary"
    );
    assert_eq!(prepared.pending_artifact.label, "Discovery report");
    assert_eq!(
        prepared.pending_artifact.canonical_path,
        "output/discovery.md"
    );
}

#[test]
fn execute_registered_playbook_run_dispatches_from_run_snapshot() {
    let workspace_root = unique_test_workspace_root("execute-discovery");
    let prepared = prepare_registered_playbook_run(RegisteredPlaybookExecutionRequest {
        task_id: "task-discovery".to_owned(),
        run_id: "run-discovery".to_owned(),
        workspace_id: "workspace-1".to_owned(),
        workspace_root: workspace_root.display().to_string(),
        playbook_key: DISCOVER_TOPICS_PLAYBOOK_KEY.to_owned(),
        playbook_version_id: Uuid::parse_str("51d4478f-c3b3-41a0-b5dd-213dc12342d5")
            .expect("fixture uuid should be valid"),
    })
    .expect("discovery playbook should prepare");

    fs::create_dir_all(&workspace_root).expect("workspace root should be created");
    fs::write(
        workspace_root.join("notes.md"),
        "# Release Notes\nMigration\nObservability\nBilling",
    )
    .expect("notes fixture should be written");

    let filesystem = LocalFilesystem::new();
    let storage = MemoryStorage::new();
    let clock = SystemClock::new();
    let mut task = prepared.task;
    let mut run = prepared.run;

    let result =
        execute_registered_playbook_run(&mut task, &mut run, &filesystem, &storage, &clock)
            .expect("prepared playbook should execute");

    assert_eq!(task.status, TaskStatus::Succeeded);
    assert_eq!(
        result.primary_artifact.canonical_path,
        "output/discovery.md"
    );
    let discovery_contents = fs::read_to_string(&result.primary_artifact.physical_path)
        .expect("discovery artifact should be readable");
    assert!(discovery_contents.contains("# 主题发现"));

    fs::remove_dir_all(workspace_root).expect("workspace cleanup should succeed");
}

fn unique_test_workspace_root(prefix: &str) -> std::path::PathBuf {
    let unique_suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_nanos();

    std::env::temp_dir().join(format!("{prefix}-{unique_suffix}"))
}
