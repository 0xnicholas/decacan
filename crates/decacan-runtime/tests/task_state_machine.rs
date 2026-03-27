#[test]
fn task_and_run_follow_expected_lifecycle() {
    use decacan_runtime::run::entity::RunStatus;
    use decacan_runtime::task::entity::TaskStatus;

    let (task, run) = decacan_runtime::task::service::start_summary_task_for_test();
    assert_eq!(task.status, TaskStatus::Planning);
    assert_eq!(run.status, RunStatus::Initialized);
}
