use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use decacan_infra::clock::system::SystemClock;
use decacan_infra::filesystem::local::LocalFilesystem;
use decacan_infra::storage::memory::MemoryStorage;
use decacan_runtime::events::TaskEventPayload;
use decacan_runtime::playbook::registry::get_registered_summary_playbook_for_test;
use decacan_runtime::policy::entity::PolicyProfile;
use decacan_runtime::ports::filesystem::FilesystemPort;
use decacan_runtime::run::entity::RunStatus;
use decacan_runtime::task::entity::{Task, TaskStatus};
use decacan_runtime::workflow::compiler::compile_summary_playbook_for_test;
use decacan_runtime::workspace::entity::Workspace;

#[test]
fn execute_summary_playbook_e2e_for_test_completes_and_reports_primary_summary_artifact() {
    let filesystem = LocalFilesystem::new();
    let storage = MemoryStorage::new();
    let clock = SystemClock::new();
    let workspace_root = unique_test_workspace_root();
    let workspace = Workspace::new_for_test(
        "workspace-1",
        "workspace",
        workspace_root.to_str().expect("workspace path should be utf-8"),
    );
    let playbook = get_registered_summary_playbook_for_test();
    let workflow = compile_summary_playbook_for_test();
    let policy = PolicyProfile::new_for_test("policy-1", &workspace.id, "default");
    let mut task = Task::new_for_test("task-1", &workspace.id, &playbook.id, workflow.version_id);
    let mut run = decacan_runtime::run::entity::Run::new_for_test(
        "run-1",
        &task.id,
        workflow,
        policy,
        workspace,
        playbook,
    );

    filesystem
        .write_string(&workspace_root.join("notes.md"), "project notes for summary")
        .expect("notes fixture should be written");
    filesystem
        .write_string(&workspace_root.join("output/summary.md"), "old summary")
        .expect("existing summary fixture should be written");

    let result = decacan_runtime::run::service::execute_standard_summary_playbook(
        &mut task,
        &mut run,
        &filesystem,
        &storage,
        &clock,
    )
    .expect("summary playbook should execute");

    assert_eq!(task.status, TaskStatus::Succeeded);
    assert_eq!(run.status, RunStatus::Completed);
    assert_eq!(result.primary_artifact.canonical_path, "output/summary.md");
    assert_eq!(
        result.projected_task_event.payload,
        TaskEventPayload::ArtifactReady {
            run_id: run.id.clone(),
            artifact_id: result.primary_artifact.id.clone(),
            logical_name: result.primary_artifact.logical_name.clone(),
            canonical_path: "output/summary.md".to_owned(),
            physical_path: result.primary_artifact.physical_path.clone(),
        }
    );

    fs::remove_dir_all(workspace_root).expect("test workspace cleanup should succeed");
}

fn unique_test_workspace_root() -> PathBuf {
    let unique_suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_nanos();

    std::env::temp_dir().join(format!("summary-playbook-e2e-{unique_suffix}"))
}
