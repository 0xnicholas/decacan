#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum RoutineKind {
    ScanMarkdownFiles,
    ReadMarkdownContents,
    DiscoverTopics,
    DraftSummary,
    BackupExistingSummary,
    WriteSummary,
    RegisterArtifact,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct Routine {
    pub id: &'static str,
    pub workflow_step_name: &'static str,
    pub kind: RoutineKind,
}
