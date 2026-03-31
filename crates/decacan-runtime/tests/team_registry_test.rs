// tests/team_registry_test.rs
use decacan_runtime::team::entity::{Role, RoleId, TeamSpec, TeamSpecId};
use decacan_runtime::team::registry::{InMemoryTeamSpecRegistry, TeamSpecRegistry};

#[test]
fn registry_can_resolve_team_spec() {
    let registry = create_test_registry();

    let team = registry
        .resolve(&TeamSpecId::new("research-team"))
        .expect("should find team");

    assert_eq!(team.id().as_str(), "research-team");
}

fn create_test_registry() -> InMemoryTeamSpecRegistry {
    let mut registry = InMemoryTeamSpecRegistry::new();

    let team = TeamSpec::new(
        TeamSpecId::new("research-team"),
        "Research Team",
        "For research tasks",
    )
    .with_lead_role(RoleId::new("synthesizer"));

    registry.register(team);
    registry
}
