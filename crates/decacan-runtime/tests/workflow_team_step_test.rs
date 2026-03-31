// tests/workflow_team_step_test.rs
use decacan_runtime::team::entity::TeamSpecId;
use decacan_runtime::workflow::step::{ExtendedWorkflowStepType, ParallelRoleGroupConfig};

#[test]
fn workflow_step_can_be_parallel_role_group() {
    let team_id = TeamSpecId::new("research-team");
    let config = ParallelRoleGroupConfig::new(team_id.clone());

    let step_type = ExtendedWorkflowStepType::ParallelRoleGroup(config);

    match step_type {
        ExtendedWorkflowStepType::ParallelRoleGroup(cfg) => {
            assert_eq!(cfg.team_spec_id().as_str(), "research-team");
        }
        _ => panic!("Expected ParallelRoleGroup variant"),
    }
}
