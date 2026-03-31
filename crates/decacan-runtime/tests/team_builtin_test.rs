// tests/team_builtin_test.rs
use decacan_runtime::team::builtin::BuiltinTeamSpecRegistry;
use decacan_runtime::team::entity::TeamSpecId;
use decacan_runtime::team::registry::TeamSpecRegistry;

#[test]
fn builtin_registry_has_research_team() {
    let registry = BuiltinTeamSpecRegistry::new();

    let team = registry
        .resolve(&TeamSpecId::new("research-team"))
        .expect("should have research-team");

    assert_eq!(team.id().as_str(), "research-team");
    assert_eq!(team.roles().len(), 3); // scout, synthesizer, verifier
}
