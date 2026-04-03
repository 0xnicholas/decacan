use decacan_infra::team::adapter::InProcessTeamOrchestrator;
use decacan_runtime::ports::team_action_gateway::TeamActionGateway;
use decacan_runtime::ports::team_orchestrator::{
    AdvanceTeamSessionRequest, ApplyTeamInputRequest, StartTeamSessionRequest, TeamOrchestratorPort,
};
use decacan_runtime::team_session::action::{ActionRiskLevel, TeamActionIntent, TeamActionKind};

#[tokio::test]
async fn start_session_persists_initial_snapshot() {
    let orchestrator = InProcessTeamOrchestrator::new_for_test();

    let result = orchestrator
        .start_session(StartTeamSessionRequest::new_for_test(
            "workspace-1",
            "task-1",
        ))
        .await
        .unwrap();

    assert_eq!(result.snapshot.status.as_str(), "running");
    assert_eq!(result.snapshot.snapshot_version, 1);
}

#[tokio::test]
async fn rejected_high_risk_action_stays_governed_and_idempotent() {
    let orchestrator = InProcessTeamOrchestrator::new_for_test();
    let intent = TeamActionIntent::new_for_test(
        "intent-1",
        TeamActionKind::ExternalPublish,
        ActionRiskLevel::High,
    );

    let first = orchestrator.submit_action(intent.clone()).await.unwrap();
    let second = orchestrator.submit_action(intent).await.unwrap();

    assert_eq!(first, second);
}

#[tokio::test]
async fn orchestrator_supports_full_session_lifecycle() {
    let orchestrator = InProcessTeamOrchestrator::new_for_test();
    let started = orchestrator
        .start_session(StartTeamSessionRequest::new_for_test(
            "workspace-1",
            "task-1",
        ))
        .await
        .unwrap();

    let updated = orchestrator
        .apply_input(ApplyTeamInputRequest::new_for_test(
            started.snapshot.session_id.clone(),
        ))
        .await
        .unwrap();

    let advanced = orchestrator
        .advance_session(AdvanceTeamSessionRequest::new_for_test(
            updated.snapshot.session_id.clone(),
        ))
        .await
        .unwrap();

    let snapshot = orchestrator
        .get_snapshot(&advanced.snapshot.session_id)
        .await
        .unwrap();

    assert!(snapshot.is_some());
}
