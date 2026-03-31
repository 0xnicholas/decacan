// tests/team_entity_test.rs
use decacan_runtime::team::entity::{Role, RoleId, TeamSpec, TeamSpecId};

#[test]
fn role_can_be_created_with_required_fields() {
    let role = Role::new(
        RoleId::new("scout"),
        "Scout",
        "Gathers initial information and context",
    )
    .with_allowed_routines(vec!["scan_markdown".to_string()])
    .with_synthesis_profile("exploration");

    assert_eq!(role.id().as_str(), "scout");
    assert_eq!(role.title(), "Scout");
    assert!(role
        .allowed_routines()
        .contains(&"scan_markdown".to_string()));
}

#[test]
fn team_spec_can_be_created_with_roles() {
    let scout = Role::new(RoleId::new("scout"), "Scout", "Gathers information");

    let synthesizer = Role::new(
        RoleId::new("synthesizer"),
        "Synthesizer",
        "Combines information",
    );

    let team = TeamSpec::new(
        TeamSpecId::new("research-team"),
        "Research Team",
        "A team for research tasks",
    )
    .with_version("1.0.0")
    .with_provider("builtin")
    .add_role(scout)
    .add_role(synthesizer)
    .with_lead_role(RoleId::new("synthesizer"));

    assert_eq!(team.id().as_str(), "research-team");
    assert_eq!(team.roles().len(), 2);
    assert_eq!(team.lead_role().as_str(), "synthesizer");
}
