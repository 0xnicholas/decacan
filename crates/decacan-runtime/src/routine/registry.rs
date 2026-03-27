use crate::routine::entity::{Routine, RoutineKind};

const SUMMARY_ROUTINES: &[Routine] = &[
    Routine {
        id: "routine.scan_markdown_files",
        workflow_step_name: "scan_markdown_files",
        kind: RoutineKind::ScanMarkdownFiles,
    },
    Routine {
        id: "routine.read_markdown_contents",
        workflow_step_name: "read_markdown_contents",
        kind: RoutineKind::ReadMarkdownContents,
    },
    Routine {
        id: "routine.discover_topics",
        workflow_step_name: "discover_topics",
        kind: RoutineKind::DiscoverTopics,
    },
    Routine {
        id: "routine.draft_summary",
        workflow_step_name: "draft_summary",
        kind: RoutineKind::DraftSummary,
    },
    Routine {
        id: "routine.backup_existing_summary",
        workflow_step_name: "backup_existing_summary",
        kind: RoutineKind::BackupExistingSummary,
    },
    Routine {
        id: "routine.write_summary",
        workflow_step_name: "write_summary",
        kind: RoutineKind::WriteSummary,
    },
    Routine {
        id: "routine.register_artifact",
        workflow_step_name: "register_artifact",
        kind: RoutineKind::RegisterArtifact,
    },
];

pub(crate) fn get_summary_routine(step_name: &str) -> Option<&'static Routine> {
    SUMMARY_ROUTINES
        .iter()
        .find(|routine| routine.workflow_step_name == step_name)
}
