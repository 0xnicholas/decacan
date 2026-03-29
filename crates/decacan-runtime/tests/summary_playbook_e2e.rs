use std::fs;

use decacan_runtime::events::TaskEventPayload;
use decacan_runtime::run::entity::RunStatus;
use decacan_runtime::task::entity::TaskStatus;
use uuid::Uuid;

#[test]
fn execute_summary_playbook_e2e_for_test_completes_and_reports_primary_summary_artifact() {
    let result = decacan_runtime::run::service::execute_summary_playbook_e2e_for_test();

    assert_eq!(result.task.status, TaskStatus::Succeeded);
    assert_ne!(result.task.playbook_version_id, Uuid::nil());
    assert_eq!(result.run.status, RunStatus::Completed);
    assert_eq!(result.primary_artifact.canonical_path, "output/summary.md");
    assert_eq!(
        result.projected_task_event.payload,
        TaskEventPayload::ArtifactReady {
            run_id: result.run.id.clone(),
            artifact_id: result.primary_artifact.id.clone(),
            logical_name: result.primary_artifact.logical_name.clone(),
            canonical_path: "output/summary.md".to_owned(),
            physical_path: result.primary_artifact.physical_path.clone(),
        }
    );

    let summary_contents = fs::read_to_string(&result.primary_artifact.physical_path)
        .expect("summary artifact should be readable");
    for section in [
        "## 总览",
        "## 主题分组",
        "## 关键结论",
        "## 信息缺口 / 待确认事项",
        "## 建议下一步",
    ] {
        assert!(
            summary_contents.contains(section),
            "summary artifact should contain section {section:?}, got:\n{summary_contents}"
        );
    }
    assert!(
        summary_contents.contains("`notes.md`"),
        "summary artifact should preserve the workspace-relative source path, got:\n{summary_contents}"
    );

    fs::remove_dir_all(result.workspace_root).expect("test workspace cleanup should succeed");
}
