use decacan_runtime::playbook::entity::Playbook;
use decacan_runtime::playbook::modes::PlaybookMode;
use decacan_runtime::policy::entity::PolicyProfile;
use decacan_runtime::run::entity::{Run, RunStatus};
use decacan_runtime::workflow::entity::Workflow;
use decacan_runtime::workflow::step::{WorkflowStep, WorkflowStepType};
use decacan_runtime::workspace::entity::Workspace;

fn summary_workflow_for_test() -> Workflow {
    Workflow::new_for_test(
        "workflow-1",
        vec![
            WorkflowStep::new_for_test(
                "step-1",
                "load_context",
                WorkflowStepType::Deterministic,
                "Load task context for summary generation",
                Some("step-2"),
            ),
            WorkflowStep::new_for_test(
                "step-2",
                "collect_materials",
                WorkflowStepType::Tool,
                "Collect source materials through the tool gateway",
                Some("step-3"),
            ),
            WorkflowStep::new_for_test(
                "step-3",
                "draft_outline",
                WorkflowStepType::Psi,
                "Draft the summary outline",
                Some("step-4"),
            ),
            WorkflowStep::new_for_test(
                "step-4",
                "compose_summary",
                WorkflowStepType::Psi,
                "Compose the summary body",
                Some("step-5"),
            ),
            WorkflowStep::new_for_test(
                "step-5",
                "normalize_output",
                WorkflowStepType::Deterministic,
                "Normalize the generated output",
                Some("step-6"),
            ),
            WorkflowStep::new_for_test(
                "step-6",
                "persist_summary",
                WorkflowStepType::Tool,
                "Persist the summary artifact candidate",
                None,
            ),
        ],
    )
}

#[test]
fn summary_workflow_steps_have_explicit_types() {
    let workflow = summary_workflow_for_test();
    assert_eq!(workflow.steps[0].r#type, WorkflowStepType::Deterministic);
    assert_eq!(workflow.steps[1].r#type, WorkflowStepType::Tool);
    assert_eq!(workflow.steps[2].r#type, WorkflowStepType::Psi);
    assert_eq!(workflow.steps[3].r#type, WorkflowStepType::Psi);
    assert_eq!(workflow.steps[4].r#type, WorkflowStepType::Deterministic);
    assert_eq!(workflow.steps[5].r#type, WorkflowStepType::Tool);
}

#[test]
fn workflow_run_and_policy_types_roundtrip_through_serde() {
    let workspace = Workspace::new_for_test("workspace-1", "workspace", "/tmp/workspace");
    let playbook = Playbook::new_for_test(
        "playbook-1",
        "workspace-1",
        "playbook.summary",
        PlaybookMode::Discovery,
    );
    let workflow = summary_workflow_for_test();
    let policy = PolicyProfile::new_for_test("policy-1", "workspace-1", "default");
    let run = Run {
        id: "run-1".to_owned(),
        task_id: "task-1".to_owned(),
        attempt_index: 0,
        created_at: workflow.compiled_at,
        workflow_snapshot: workflow.clone(),
        policy_snapshot: policy.clone(),
        workspace_snapshot: workspace.clone(),
        playbook_snapshot: playbook.clone(),
        status: RunStatus::Initialized,
        current_step_id: Some("step-1".to_owned()),
        step_cursor: 0,
        started_at: None,
        finished_at: None,
        pause_reason: None,
        event_ids: Vec::new(),
        intermediate_outputs: Vec::new(),
        output_candidates: vec!["artifacts/summary.md".to_owned()],
        write_operations: Vec::new(),
        error_details: None,
    };

    let encoded = serde_json::to_string(&workflow).unwrap();
    let decoded: Workflow = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, workflow);

    let step = workflow.steps[0].clone();
    let encoded = serde_json::to_string(&step).unwrap();
    let decoded: WorkflowStep = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, step);

    let status = RunStatus::Initialized;
    let encoded = serde_json::to_string(&status).unwrap();
    let decoded: RunStatus = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, status);

    let encoded = serde_json::to_string(&policy).unwrap();
    let decoded: PolicyProfile = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, policy);

    let encoded = serde_json::to_string(&run).unwrap();
    let decoded: Run = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, run);
}
