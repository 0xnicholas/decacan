// tests/team_assignment_test.rs
use decacan_runtime::team::assignment::{AssignmentStatus, RoleAssignment, RoleAssignmentId};
use decacan_runtime::team::entity::{RoleId, TeamSpecId};

#[test]
fn role_assignment_can_be_created() {
    let assignment = RoleAssignment::new(
        RoleAssignmentId::new("assign-1"),
        RoleId::new("scout"),
        TeamSpecId::new("research-team"),
    );

    assert_eq!(assignment.id().as_str(), "assign-1");
    assert_eq!(assignment.role_id().as_str(), "scout");
    assert!(matches!(assignment.status(), AssignmentStatus::Pending));
}

#[test]
fn role_assignment_can_complete() {
    let mut assignment = RoleAssignment::new(
        RoleAssignmentId::new("assign-1"),
        RoleId::new("scout"),
        TeamSpecId::new("research-team"),
    );

    assignment.complete("scout output data".to_string());

    assert!(matches!(
        assignment.status(),
        AssignmentStatus::Completed { .. }
    ));
    assert_eq!(assignment.output().unwrap(), "scout output data");
}
