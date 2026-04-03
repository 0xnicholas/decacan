use crate::team_session::action::ActionRiskLevel;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DelegatedAuthorityScope {
    pub max_risk_level: ActionRiskLevel,
    pub allow_all_actions: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DelegatedAuthorityGrant {
    pub workspace_id: String,
    pub user_id: String,
    pub scope: DelegatedAuthorityScope,
}

impl DelegatedAuthorityGrant {
    pub fn allow_all_for_test(workspace_id: impl Into<String>, user_id: impl Into<String>) -> Self {
        Self {
            workspace_id: workspace_id.into(),
            user_id: user_id.into(),
            scope: DelegatedAuthorityScope {
                max_risk_level: ActionRiskLevel::High,
                allow_all_actions: true,
            },
        }
    }
}
