use decacan_app::app::recovery::RecoveryReport;
use decacan_app::app::state::AppState;
use decacan_infra::persistence::assistant_delegations::InMemoryAssistantDelegationBindingStore;
use decacan_runtime::assistant::session::{AssistantDelegationBinding, AssistantDelegationStatus};
use decacan_runtime::persistence::assistant_delegations::AssistantDelegationBindingStore;

/// Test that recovery runs successfully with active delegations
#[tokio::test]
async fn recovery_runs_successfully_with_delegations() {
    // Create a delegation store and populate it with active delegations
    let delegation_store = InMemoryAssistantDelegationBindingStore::new();

    // Create two active delegations
    let binding1 = AssistantDelegationBinding {
        assistant_session_id: "assistant-session-1".to_string(),
        task_id: "task-1".to_string(),
        run_id: "run-1".to_string(),
        team_session_id: "team-session-1".to_string(),
        workspace_id: "workspace-1".to_string(),
        status: AssistantDelegationStatus::Active,
    };

    let binding2 = AssistantDelegationBinding {
        assistant_session_id: "assistant-session-2".to_string(),
        task_id: "task-2".to_string(),
        run_id: "run-2".to_string(),
        team_session_id: "team-session-2".to_string(),
        workspace_id: "workspace-1".to_string(),
        status: AssistantDelegationStatus::Active,
    };

    // Save delegations to store
    delegation_store.save(binding1.clone()).await.unwrap();
    delegation_store.save(binding2.clone()).await.unwrap();

    // Create a fresh AppState (simulating app restart)
    let app_state = AppState::new_for_test().await;

    // Run recovery
    let report: RecoveryReport = app_state
        .recover_assistant_sessions(delegation_store)
        .await
        .unwrap();

    // Verify recovery report
    assert_eq!(report.sessions_recovered, 2, "Should recover 2 sessions");
    assert!(report.errors.is_empty(), "Should have no errors");
}

/// Test that recovery only restores active delegations
#[tokio::test]
async fn recovery_only_restores_active_delegations() {
    let delegation_store = InMemoryAssistantDelegationBindingStore::new();

    // Create one active and one completed delegation
    let active_binding = AssistantDelegationBinding {
        assistant_session_id: "assistant-session-active".to_string(),
        task_id: "task-active".to_string(),
        run_id: "run-active".to_string(),
        team_session_id: "team-session-active".to_string(),
        workspace_id: "workspace-1".to_string(),
        status: AssistantDelegationStatus::Active,
    };

    let completed_binding = AssistantDelegationBinding {
        assistant_session_id: "assistant-session-completed".to_string(),
        task_id: "task-completed".to_string(),
        run_id: "run-completed".to_string(),
        team_session_id: "team-session-completed".to_string(),
        workspace_id: "workspace-1".to_string(),
        status: AssistantDelegationStatus::Completed,
    };

    delegation_store.save(active_binding).await.unwrap();
    delegation_store.save(completed_binding).await.unwrap();

    let app_state = AppState::new_for_test().await;
    let report: RecoveryReport = app_state
        .recover_assistant_sessions(delegation_store)
        .await
        .unwrap();

    // Only active delegations should be recovered
    assert_eq!(report.sessions_recovered, 1, "Should recover only active sessions");
    assert!(report.errors.is_empty(), "Should have no errors");
}

/// Test recovery with empty persistence
#[tokio::test]
async fn recovery_with_no_delegations_returns_empty_report() {
    let delegation_store = InMemoryAssistantDelegationBindingStore::new();
    let app_state = AppState::new_for_test().await;

    let report: RecoveryReport = app_state
        .recover_assistant_sessions(delegation_store)
        .await
        .unwrap();

    assert_eq!(report.sessions_recovered, 0, "Should report 0 sessions");
    assert!(report.errors.is_empty(), "Should have no errors");
}
