use crate::team::entity::{TeamSpec, TeamSpecId};
use std::collections::HashMap;

pub trait TeamSpecRegistry {
    fn resolve(&self, id: &TeamSpecId) -> Option<TeamSpec>;
    fn list_available(&self) -> Vec<&TeamSpecId>;
}

#[derive(Debug, Default)]
pub struct InMemoryTeamSpecRegistry {
    specs: HashMap<String, TeamSpec>,
}

impl InMemoryTeamSpecRegistry {
    pub fn new() -> Self {
        Self {
            specs: HashMap::new(),
        }
    }

    pub fn register(&mut self, spec: TeamSpec) {
        self.specs.insert(spec.id().as_str().to_string(), spec);
    }
}

impl TeamSpecRegistry for InMemoryTeamSpecRegistry {
    fn resolve(&self, id: &TeamSpecId) -> Option<TeamSpec> {
        self.specs.get(id.as_str()).cloned()
    }

    fn list_available(&self) -> Vec<&TeamSpecId> {
        self.specs.values().map(|s| s.id()).collect()
    }
}
