use crate::team::entity::{Role, RoleId, TeamSpec, TeamSpecId};
use crate::team::registry::TeamSpecRegistry;
use std::collections::HashMap;

pub struct BuiltinTeamSpecRegistry {
    specs: HashMap<String, TeamSpec>,
}

impl BuiltinTeamSpecRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            specs: HashMap::new(),
        };
        registry.init_builtin_specs();
        registry
    }

    fn init_builtin_specs(&mut self) {
        // Research Team
        let scout = Role::new(
            RoleId::new("scout"),
            "Scout",
            "Gathers initial information and context from sources",
        )
        .with_allowed_routines(vec![
            "scan_markdown".to_string(),
            "read_contents".to_string(),
        ]);

        let synthesizer = Role::new(
            RoleId::new("synthesizer"),
            "Synthesizer",
            "Combines information into coherent summaries",
        )
        .with_allowed_routines(vec!["draft_summary".to_string()])
        .with_synthesis_profile("consolidation");

        let verifier = Role::new(
            RoleId::new("verifier"),
            "Verifier",
            "Checks accuracy and completeness of outputs",
        )
        .with_allowed_routines(vec!["validate_output".to_string()]);

        let research_team = TeamSpec::new(
            TeamSpecId::new("research-team"),
            "Research Team",
            "A three-role team for research and synthesis tasks",
        )
        .with_version("1.0.0")
        .with_provider("builtin")
        .add_role(scout)
        .add_role(synthesizer)
        .add_role(verifier)
        .with_lead_role(RoleId::new("synthesizer"));

        self.specs
            .insert(research_team.id().as_str().to_string(), research_team);
    }
}

impl TeamSpecRegistry for BuiltinTeamSpecRegistry {
    fn resolve(&self, id: &TeamSpecId) -> Option<TeamSpec> {
        self.specs.get(id.as_str()).cloned()
    }

    fn list_available(&self) -> Vec<&TeamSpecId> {
        self.specs.values().map(|s| s.id()).collect()
    }
}
