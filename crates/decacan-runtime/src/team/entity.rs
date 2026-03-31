use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RoleId(String);

impl RoleId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    id: RoleId,
    title: String,
    responsibility: String,
    allowed_routines: Vec<String>,
    synthesis_profile: Option<String>,
}

impl Role {
    pub fn new(id: RoleId, title: impl Into<String>, responsibility: impl Into<String>) -> Self {
        Self {
            id,
            title: title.into(),
            responsibility: responsibility.into(),
            allowed_routines: Vec::new(),
            synthesis_profile: None,
        }
    }

    pub fn with_allowed_routines(mut self, routines: Vec<String>) -> Self {
        self.allowed_routines = routines;
        self
    }

    pub fn with_synthesis_profile(mut self, profile: impl Into<String>) -> Self {
        self.synthesis_profile = Some(profile.into());
        self
    }

    pub fn id(&self) -> &RoleId {
        &self.id
    }

    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn allowed_routines(&self) -> &[String] {
        &self.allowed_routines
    }
}
