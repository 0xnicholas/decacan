use super::entity::{
    DraftHealthIssue, DraftHealthIssueDomain, DraftHealthIssueSeverity,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CapabilityRefUse {
    pub location: String,
    pub reference: String,
}

const BUILTIN_CAPABILITY_REFS: &[&str] = &[
    "builtin.scan_markdown_files",
    "builtin.backup_existing_output",
    "builtin.workspace.read",
    "builtin.artifact.write",
    "builtin.output_contract.summary",
];

pub fn unresolved_capability_ref_issues(spec_document: &str) -> Vec<DraftHealthIssue> {
    declared_capability_refs(spec_document)
        .into_iter()
        .filter(|reference| !is_supported_builtin_ref(&reference.reference))
        .map(|reference| DraftHealthIssue {
            severity: DraftHealthIssueSeverity::Error,
            domain: DraftHealthIssueDomain::Capabilities,
            kind: "unresolved".to_owned(),
            location: Some(reference.location),
            message: "capability ref cannot be resolved".to_owned(),
            related_ref: Some(reference.reference),
        })
        .collect()
}

pub fn resolved_builtin_capability_refs(spec_document: &str) -> Vec<String> {
    declared_capability_refs(spec_document)
        .into_iter()
        .filter(|reference| is_supported_builtin_ref(&reference.reference))
        .map(|reference| reference.reference)
        .collect()
}

fn declared_capability_refs(spec_document: &str) -> Vec<CapabilityRefUse> {
    let mut references = Vec::new();
    let mut in_capability_refs = false;
    let mut current_group: Option<String> = None;
    let mut current_index = 0usize;

    for line in spec_document.lines() {
        let trimmed = line.trim();
        let indent = line.chars().take_while(|character| *character == ' ').count();

        if !in_capability_refs {
            if trimmed == "capability_refs:" {
                in_capability_refs = true;
            }
            continue;
        }

        if trimmed.is_empty() {
            continue;
        }

        if indent == 0 {
            break;
        }

        if indent == 2 && trimmed.ends_with(':') {
            current_group = Some(trimmed.trim_end_matches(':').to_owned());
            current_index = 0;
            continue;
        }

        if indent >= 4 && trimmed.starts_with("- ") {
            if let Some(group) = current_group.as_deref() {
                references.push(CapabilityRefUse {
                    location: format!("capability_refs.{group}[{current_index}]"),
                    reference: trimmed.trim_start_matches("- ").trim().to_owned(),
                });
                current_index += 1;
            }
        }
    }

    references
}

fn is_supported_builtin_ref(reference: &str) -> bool {
    BUILTIN_CAPABILITY_REFS.contains(&reference)
}
