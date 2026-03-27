use decacan_runtime::gateway::semantic_adapter::SemanticGatewayAdapter;
use decacan_runtime::gateway::tool_gateway::ToolGateway;
use decacan_runtime::policy::entity::PolicyProfile;
use decacan_runtime::semantic::model::{ModelContext, OutputCandidate, SemanticModel};

#[test]
fn semantic_invocation_requests_tool_and_returns_output_candidate() {
    let gateway = ToolGateway::new(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
    );
    let tool_protocol = SemanticGatewayAdapter::new(gateway);
    let model = SummaryModelForTest;
    let result =
        decacan_runtime::semantic::executor::run_summary_invocation_for_test(&tool_protocol, &model);

    assert_eq!(result.output_candidates.len(), 1);
}

#[derive(Debug, Clone, Copy)]
struct SummaryModelForTest;

impl SemanticModel for SummaryModelForTest {
    type Error = ();

    fn produce_output_candidate(
        &self,
        context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error> {
        Ok(OutputCandidate {
            artifact_id: "artifact-summary-1".to_owned(),
            logical_name: "summary.md".to_owned(),
            canonical_path: format!("/{}/summary.md", context.task_id),
            physical_path: format!("/tmp/{}/summary.md", context.run_id),
            content: format!("Summary generated from {}", context.source_material),
        })
    }
}
