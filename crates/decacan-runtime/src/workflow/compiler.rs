use crate::playbook::entity::Playbook;
use crate::playbook::modes::PlaybookMode;
use crate::playbook::registry::{find_registered_playbook_for_test, SUMMARY_PLAYBOOK_KEY};

use super::entity::Workflow;
use super::step::{WorkflowStep, WorkflowStepType};

pub fn compile_playbook(playbook: &Playbook) -> Option<Workflow> {
    match (playbook.key.as_str(), playbook.mode) {
        (SUMMARY_PLAYBOOK_KEY, PlaybookMode::Standard) => Some(summary_workflow(playbook)),
        _ => None,
    }
}

pub fn compile_summary_playbook_for_test() -> Workflow {
    let playbook = find_registered_playbook_for_test(SUMMARY_PLAYBOOK_KEY)
        .expect("summary playbook should be registered");

    compile_playbook(&playbook).expect("summary playbook should compile")
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
