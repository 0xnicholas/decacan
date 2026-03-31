// tests/team_entity_test.rs
use decacan_runtime::team::entity::{Role, RoleId};

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
