use crate::playbook::entity::Playbook;
use crate::playbook::modes::PlaybookMode;
use crate::playbook::registry::{
    get_registered_discovery_playbook_for_test, get_registered_summary_playbook_for_test,
    DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY,
};

use super::entity::Workflow;
use super::step::{WorkflowStep, WorkflowStepType};

pub fn compile_playbook(playbook: &Playbook) -> Option<Workflow> {
    match (playbook.key.as_str(), playbook.mode) {
        (SUMMARY_PLAYBOOK_KEY, PlaybookMode::Standard) => Some(summary_workflow(playbook)),
        (DISCOVER_TOPICS_PLAYBOOK_KEY, PlaybookMode::Discovery) => {
            Some(discovery_workflow(playbook))
        }
        _ => None,
    }
}

pub fn compile_summary_playbook_for_test() -> Workflow {
    let playbook = get_registered_summary_playbook_for_test();

    compile_playbook(&playbook).expect("summary playbook should compile")
}

pub fn compile_discovery_playbook_for_test() -> Workflow {
    let playbook = get_registered_discovery_playbook_for_test();

    compile_playbook(&playbook).expect("discovery playbook should compile")
}

fn summary_workflow(playbook: &Playbook) -> Workflow {
    Workflow::new_for_test(
        "workflow-summary",
        &playbook.id,
        vec![
            WorkflowStep::new_for_test(
                "scan_markdown_files",
                "scan_markdown_files",
                WorkflowStepType::Deterministic,
                "Scan the workspace for markdown files that can be summarized.",
                Some("read_markdown_contents"),
            ),
            WorkflowStep::new_for_test(
                "read_markdown_contents",
                "read_markdown_contents",
                WorkflowStepType::Tool,
                "Read the selected markdown file contents into workflow context.",
                Some("discover_topics"),
            ),
            WorkflowStep::new_for_test(
                "discover_topics",
                "discover_topics",
                WorkflowStepType::Psi,
                "Identify the primary topics covered by the markdown sources.",
                Some("draft_summary"),
            ),
            WorkflowStep::new_for_test(
                "draft_summary",
                "draft_summary",
                WorkflowStepType::Psi,
                "Draft a concise summary from the discovered topics and sources.",
                Some("backup_existing_summary"),
            ),
            WorkflowStep::new_for_test(
                "backup_existing_summary",
                "backup_existing_summary",
                WorkflowStepType::Deterministic,
                "Prepare a backup location before overwriting an existing summary artifact.",
                Some("write_summary"),
            ),
            WorkflowStep::new_for_test(
                "write_summary",
                "write_summary",
                WorkflowStepType::Tool,
                "Write the generated summary to the target markdown artifact path.",
                Some("register_artifact"),
            ),
            WorkflowStep::new_for_test(
                "register_artifact",
                "register_artifact",
                WorkflowStepType::Deterministic,
                "Register the written summary as the workflow output artifact.",
                None,
            ),
        ],
    )
}

fn discovery_workflow(playbook: &Playbook) -> Workflow {
    Workflow::new_for_test(
        "workflow-discovery",
        &playbook.id,
        vec![
            WorkflowStep::new_for_test(
                "scan_markdown_files",
                "scan_markdown_files",
                WorkflowStepType::Deterministic,
                "Scan the workspace for markdown files that can be inspected for themes.",
                Some("read_markdown_contents"),
            ),
            WorkflowStep::new_for_test(
                "read_markdown_contents",
                "read_markdown_contents",
                WorkflowStepType::Tool,
                "Read the selected markdown file contents into workflow context.",
                Some("discover_themes"),
            ),
            WorkflowStep::new_for_test(
                "discover_themes",
                "discover_themes",
                WorkflowStepType::Psi,
                "Identify recurring themes in the markdown sources.",
                Some("draft_discovery"),
            ),
            WorkflowStep::new_for_test(
                "draft_discovery",
                "draft_discovery",
                WorkflowStepType::Psi,
                "Produce a lightweight discovery report from the identified themes.",
                Some("write_discovery"),
            ),
            WorkflowStep::new_for_test(
                "write_discovery",
                "write_discovery",
                WorkflowStepType::Tool,
                "Write the discovery report to the target markdown artifact path.",
                Some("register_artifact"),
            ),
            WorkflowStep::new_for_test(
                "register_artifact",
                "register_artifact",
                WorkflowStepType::Deterministic,
                "Register the written discovery report as the workflow output artifact.",
                None,
            ),
        ],
    )
}
