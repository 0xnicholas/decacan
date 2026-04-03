use crate::authority::grant::DelegatedAuthorityGrant;
use crate::team_session::action::TeamActionIntent;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthorityDecision {
    AllowAsAssistant,
    EscalateToHuman,
    Deny,
}

#[derive(Debug, Default, Clone, Copy)]
pub struct AuthorityEvaluator;

impl AuthorityEvaluator {
    pub fn evaluate(
        &self,
        grant: &DelegatedAuthorityGrant,
        intent: &TeamActionIntent,
    ) -> AuthorityDecision {
        if intent.kind.is_mandatory_human_confirm() {
            return AuthorityDecision::EscalateToHuman;
        }
        if grant.scope.max_risk_level < intent.risk_level {
            return AuthorityDecision::EscalateToHuman;
        }
        if !grant.scope.allow_all_actions {
            return AuthorityDecision::Deny;
        }
        AuthorityDecision::AllowAsAssistant
    }
}
