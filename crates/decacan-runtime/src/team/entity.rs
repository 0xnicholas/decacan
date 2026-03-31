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

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TeamSpecId(String);

impl TeamSpecId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamSpec {
    id: TeamSpecId,
    title: String,
    summary: String,
    version: String,
    provider: String,
    roles: Vec<Role>,
    lead_role: RoleId,
    compatibility: Vec<String>,
}

impl TeamSpec {
    pub fn new(id: TeamSpecId, title: impl Into<String>, summary: impl Into<String>) -> Self {
        Self {
            id,
            title: title.into(),
            summary: summary.into(),
            version: "1.0.0".to_string(),
            provider: "builtin".to_string(),
            roles: Vec::new(),
            lead_role: RoleId::new(""),
            compatibility: Vec::new(),
        }
    }

    pub fn with_version(mut self, version: impl Into<String>) -> Self {
        self.version = version.into();
        self
    }

    pub fn with_provider(mut self, provider: impl Into<String>) -> Self {
        self.provider = provider.into();
        self
    }

    pub fn add_role(mut self, role: Role) -> Self {
        self.roles.push(role);
        self
    }

    pub fn with_lead_role(mut self, lead_role: RoleId) -> Self {
        self.lead_role = lead_role;
        self
    }

    pub fn id(&self) -> &TeamSpecId {
        &self.id
    }

    pub fn roles(&self) -> &[Role] {
        &self.roles
    }

    pub fn lead_role(&self) -> &RoleId {
        &self.lead_role
    }

    pub fn version(&self) -> &str {
        &self.version
    }

    pub fn provider(&self) -> &str {
        &self.provider
    }
}
