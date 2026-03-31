// tests/merge_bundle_test.rs
use decacan_runtime::merge::bundle::{AssignmentOutput, MergeInputBundle};
use decacan_runtime::team::entity::RoleId;

#[test]
fn merge_bundle_can_aggregate_outputs() {
    let mut bundle = MergeInputBundle::new();

    bundle.add_output(AssignmentOutput::new(
        RoleId::new("scout"),
        "Scout found X".to_string(),
    ));

    bundle.add_output(AssignmentOutput::new(
        RoleId::new("synthesizer"),
        "Synthesizer conclusion Y".to_string(),
    ));

    assert_eq!(bundle.outputs().len(), 2);

    let merged = bundle.concatenate();
    assert!(merged.contains("Scout found X"));
    assert!(merged.contains("Synthesizer conclusion Y"));
}
