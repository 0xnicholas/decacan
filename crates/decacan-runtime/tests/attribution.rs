use decacan_runtime::trace::attribution::AttributionEngine;
use decacan_runtime::trace::entities::*;

#[test]
fn test_runtime_error_attribution() {
    let error = RuntimeError {
        error_type: "CapabilityNotFound".to_string(),
        capability_ref: Some("builtin.nonexistent".to_string()),
        message: "Capability not registered".to_string(),
    };

    let attribution = AttributionEngine::analyze(&FailureCategory::Runtime(error));

    assert!(matches!(
        attribution.attribution,
        AttributionTarget::DraftCapabilityRef { .. }
    ));
    assert!(attribution.suggested_fix.contains("检查 capability_ref"));
}

#[test]
fn test_quality_failure_attribution() {
    let issue = QualityIssue {
        dimension: "coverage".to_string(),
        score: 0.3,
        threshold: 0.7,
    };

    let attribution = AttributionEngine::analyze(&FailureCategory::Quality(issue));

    assert!(matches!(
        attribution.attribution,
        AttributionTarget::KnowledgeCard { .. }
    ));
}
