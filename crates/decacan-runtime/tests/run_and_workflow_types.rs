#[test]
fn summary_workflow_steps_have_explicit_types() {
    use decacan_runtime::workflow::step::WorkflowStepType;

    let steps = decacan_runtime::workflow::entity::summary_workflow_step_types_for_test();
    assert_eq!(steps[0], WorkflowStepType::Deterministic);
    assert_eq!(steps[1], WorkflowStepType::Tool);
    assert_eq!(steps[2], WorkflowStepType::Psi);
    assert_eq!(steps[3], WorkflowStepType::Psi);
    assert_eq!(steps[4], WorkflowStepType::Deterministic);
    assert_eq!(steps[5], WorkflowStepType::Tool);
}
