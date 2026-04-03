use decacan_runtime::assistant::session::AssistantDelegationBinding;
use decacan_runtime::authority::evaluator::{AuthorityDecision, AuthorityEvaluator};
use decacan_runtime::authority::grant::DelegatedAuthorityGrant;
use decacan_runtime::ports::team_action_gateway::TeamActionDisposition;
use decacan_runtime::team_session::action::{ActionRiskLevel, TeamActionIntent, TeamActionKind};
use decacan_runtime::team_session::entity::{TeamExecutionPhase, TeamSessionStatus};
use decacan_runtime::team_session::snapshot::TeamSessionSnapshot;

#[test]
fn assistant_cannot_auto_approve_mandatory_human_confirm_actions() {
    let grant = DelegatedAuthorityGrant::allow_all_for_test("workspace-1", "user-1");
    let intent = TeamActionIntent::new_for_test(
        "intent-1",
        TeamActionKind::WorkspaceRoleChange,
        ActionRiskLevel::High,
    );

    let decision = AuthorityEvaluator::default().evaluate(&grant, &intent);

    assert_eq!(decision, AuthorityDecision::EscalateToHuman);
}

#[test]
fn running_session_can_enter_blocked_on_assistant_but_not_completed_session() {
    assert!(TeamSessionStatus::Running.can_transition_to(&TeamSessionStatus::BlockedOnAssistant));
    assert!(!TeamSessionStatus::Completed.can_transition_to(&TeamSessionStatus::BlockedOnAssistant));
    assert_eq!(TeamExecutionPhase::Planning.as_str(), "planning");
}

#[test]
fn only_one_active_delegation_is_allowed_per_assistant_session() {
    let session =
        decacan_runtime::assistant::session::AssistantSession::new_for_test("assistant-1")
            .with_active_delegation("task-1", "run-1", "team-session-1");

    assert!(session.can_start_new_delegation().is_err());
}

#[test]
fn snapshot_resume_requires_matching_version_and_token() {
    let snapshot = TeamSessionSnapshot::new_for_test("session-1")
        .with_snapshot_version(4)
        .with_continuation_token("token-4");

    assert!(snapshot.can_resume("token-4", 4));
    assert!(!snapshot.can_resume("token-3", 4));
    assert!(!snapshot.can_resume("token-4", 3));
}

#[test]
fn rejected_approval_requires_new_intent_version_before_reopen() {
    let disposition = TeamActionDisposition::approval_rejected("approval-1", 3);

    assert!(!disposition.can_reopen_with_intent_version(3));
    assert!(disposition.can_reopen_with_intent_version(4));
}

#[test]
fn assistant_delegation_binding_is_persisted_for_recovery() {
    let binding = AssistantDelegationBinding::new_for_test(
        "assistant-1",
        "task-1",
        "run-1",
        "team-session-1",
    );

    assert_eq!(binding.team_session_id, "team-session-1");
}

#[test]
fn evolution_proposal_is_review_projection_not_direct_strategy_mutation() {
    let snapshot = TeamSessionSnapshot::new_for_test("session-1").with_evolution_proposal_for_test(
        "proposal-1",
        "Use stricter validator chain",
        "pending",
    );

    assert_eq!(snapshot.evolution_proposals.len(), 1);
    assert_eq!(snapshot.evolution_proposals[0].review_state, "pending");

    let mut reviewed = snapshot.clone();
    reviewed.evolution_proposals[0].review_state = "approved".to_owned();

    assert_eq!(snapshot.evolution_proposals[0].review_state, "pending");
    assert_eq!(reviewed.evolution_proposals[0].review_state, "approved");
}
