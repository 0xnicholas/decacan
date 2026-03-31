// tests/run_team_state_test.rs
use decacan_runtime::run::entity::ParallelRoleGroupState;
use decacan_runtime::team::assignment::{RoleAssignment, RoleAssignmentId};
use decacan_runtime::team::entity::{RoleId, TeamSpecId};

#[test]
fn run_can_track_parallel_role_group() {
    let mut group_state = ParallelRoleGroupState::new(TeamSpecId::new("research-team"));

    // Add assignments
    let assignment1 = RoleAssignment::new(
        RoleAssignmentId::new("a1"),
        RoleId::new("scout"),
        TeamSpecId::new("research-team"),
    );
    group_state.add_assignment(assignment1);

    assert_eq!(group_state.assignments().len(), 1);
    assert!(!group_state.all_required_completed());
}
