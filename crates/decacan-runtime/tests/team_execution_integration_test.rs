// tests/team_execution_integration_test.rs
use decacan_runtime::merge::bundle::MergeInputBundle;
use decacan_runtime::run::entity::ParallelRoleGroupState;
use decacan_runtime::team::assignment::{RoleAssignment, RoleAssignmentId};
use decacan_runtime::team::builtin::BuiltinTeamSpecRegistry;
use decacan_runtime::team::entity::TeamSpecId;
use decacan_runtime::team::registry::TeamSpecRegistry;

#[test]
fn team_execution_full_flow() {
    // 1. Setup: Get team spec from registry
    let registry = BuiltinTeamSpecRegistry::new();
    let team = registry
        .resolve(&TeamSpecId::new("research-team"))
        .expect("research-team should exist");

    // 2. Create parallel role group state
    let mut group_state = ParallelRoleGroupState::new(team.id().clone());

    // 3. Create assignments for each role
    for role in team.roles() {
        let assignment = RoleAssignment::new(
            RoleAssignmentId::new(format!("assign-{}-001", role.id().as_str())),
            role.id().clone(),
            team.id().clone(),
        );
        group_state.add_assignment(assignment);
    }

    assert_eq!(group_state.assignments().len(), 3);
    assert!(!group_state.all_required_completed());

    // 4. Simulate completing assignments
    let assignments: Vec<_> = group_state
        .assignments()
        .iter()
        .map(|a| (a.id().clone(), a.role_id().clone()))
        .collect();

    for (assign_id, role_id) in assignments {
        // In real execution, we'd look up the assignment and complete it
        // For this test, we just verify the structure exists
        println!(
            "Role {} assigned with {}",
            role_id.as_str(),
            assign_id.as_str()
        );
    }

    // 5. Create merge bundle
    let mut bundle = MergeInputBundle::new();
    bundle.add_output(decacan_runtime::merge::bundle::AssignmentOutput::new(
        decacan_runtime::team::entity::RoleId::new("scout"),
        "Scout findings...".to_string(),
    ));
    bundle.add_output(decacan_runtime::merge::bundle::AssignmentOutput::new(
        decacan_runtime::team::entity::RoleId::new("synthesizer"),
        "Synthesized summary...".to_string(),
    ));

    let merged = bundle.concatenate();
    assert!(!merged.is_empty());

    println!("Merged output:\n{}", merged);
}
