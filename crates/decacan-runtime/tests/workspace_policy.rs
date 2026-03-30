use decacan_runtime::workspace::entity::{
    PathRules, PolicyProfile, ReadBoundary, Workspace, WorkspacePolicy, WorkspaceScope,
    WriteBoundary, WriteMode,
};
use decacan_runtime::workspace::policy::{BoundInputs, PathValidator, WorkspacePolicyResolver};
use std::path::{Path, PathBuf};

#[test]
fn policy_profile_has_workspace_policy_defaults() {
    let profile = PolicyProfile::new(
        "policy-1",
        "ws-1",
        "Default Policy",
        vec!["workspace.read".to_string()],
        vec!["shell.exec".to_string()],
        vec!["network.egress".to_string()],
    );

    assert_eq!(profile.id, "policy-1");
    assert!(matches!(
        profile.default_scope,
        WorkspaceScope::FullWorkspace
    ));
    assert!(matches!(profile.default_write_mode, WriteMode::OutputOnly));
    assert!(profile.default_path_rules.prevent_escape);
}

#[test]
fn workspace_policy_has_all_boundary_fields() {
    let policy = WorkspacePolicy::new(
        "wp-1",
        "ws-1",
        WorkspaceScope::FullWorkspace,
        ReadBoundary::default(),
        WriteBoundary::output_only(PathBuf::from("/output")),
        PathRules::default(),
    );

    assert_eq!(policy.id, "wp-1");
    assert!(policy.write_boundary.is_restricted_to_output());
    assert!(policy.path_rules.prevent_escape);
}

#[test]
fn write_boundary_output_only_restricts_writes() {
    let boundary = WriteBoundary::output_only(PathBuf::from("/workspace/output"));

    assert!(boundary.is_restricted_to_output());
    assert!(!boundary.allows_write_to(PathBuf::from("/workspace/other")));
    assert!(boundary.allows_write_to(PathBuf::from("/workspace/output/file.txt")));
}

#[test]
fn path_rules_blocks_traversal() {
    let rules = PathRules::default();
    assert!(!rules.is_valid_path("/workspace/output/../secrets.txt"));
    assert!(rules.is_valid_path("/workspace/output/file.txt"));
}

#[test]
fn resolver_creates_policy_from_workspace_and_profile() {
    let workspace = Workspace::new_for_test("ws-1", "Test", "/workspace/ws-1");
    let profile = PolicyProfile::new_for_test("policy-1", "ws-1");
    let inputs = BoundInputs::default();

    let resolver = WorkspacePolicyResolver::new(&workspace, &profile, &inputs);
    let policy = resolver.resolve();

    assert!(policy.id.starts_with("resolved-"));
    assert!(policy.write_boundary.is_restricted_to_output());
}

#[test]
fn path_validator_blocks_traversal() {
    let validator = PathValidator::default();

    assert!(!validator.is_within_boundary(
        Path::new("/workspace/output/../secrets.txt"),
        Path::new("/workspace")
    ));

    assert!(validator.is_within_boundary(
        Path::new("/workspace/output/file.txt"),
        Path::new("/workspace")
    ));
}

#[test]
fn path_validator_normalizes_paths() {
    let validator = PathValidator::default();
    let normalized = validator.normalize(Path::new("/workspace/output/../file.txt"));
    assert_eq!(normalized, Path::new("/workspace/file.txt"));
}
