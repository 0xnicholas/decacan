use crate::dto::{
    ActivityDto, MemberDto, WorkspaceDeliverableDto, WorkspaceHomeAttentionItemDto,
    WorkspaceHomeDto, WorkspaceTaskHealthDto,
};

pub fn build_workspace_home_stub(workspace_id: &str) -> WorkspaceHomeDto {
    WorkspaceHomeDto {
        attention: vec![
            WorkspaceHomeAttentionItemDto {
                id: "attention-1".to_owned(),
                title: "Legal copy sign-off pending".to_owned(),
                reason: "Final launch copy is waiting for approval before release.".to_owned(),
                severity: "high".to_owned(),
            },
            WorkspaceHomeAttentionItemDto {
                id: "attention-2".to_owned(),
                title: "Benchmark rerun requested".to_owned(),
                reason: "Performance baseline drifted after latest model update.".to_owned(),
                severity: "medium".to_owned(),
            },
        ],
        task_health: WorkspaceTaskHealthDto {
            running: 4,
            waiting_approval: 2,
            blocked: 1,
            completed_today: 9,
        },
        activity: vec![
            ActivityDto {
                id: "activity-1".to_owned(),
                message: format!("{workspace_id}: Summary rollout task moved to final QA."),
                relative_time: "5m ago".to_owned(),
            },
            ActivityDto {
                id: "activity-2".to_owned(),
                message: "Approval queue drained for doc indexing updates.".to_owned(),
                relative_time: "18m ago".to_owned(),
            },
            ActivityDto {
                id: "activity-3".to_owned(),
                message: "New deliverable draft exported to output/release-notes.md.".to_owned(),
                relative_time: "42m ago".to_owned(),
            },
        ],
        deliverables: vec![
            WorkspaceDeliverableDto {
                id: "deliverable-1".to_owned(),
                label: "Release Notes Draft".to_owned(),
                canonical_path: "output/release-notes.md".to_owned(),
                status: "reviewing".to_owned(),
            },
            WorkspaceDeliverableDto {
                id: "deliverable-2".to_owned(),
                label: "Launch Narrative".to_owned(),
                canonical_path: "output/launch-story.md".to_owned(),
                status: "ready".to_owned(),
            },
        ],
        team_snapshot: vec![
            MemberDto {
                id: "member-1".to_owned(),
                name: "Ari".to_owned(),
                role: "Project Lead".to_owned(),
                focus: "Final milestone coordination".to_owned(),
                status: "online".to_owned(),
            },
            MemberDto {
                id: "member-2".to_owned(),
                name: "Mina".to_owned(),
                role: "Ops".to_owned(),
                focus: "Approval triage".to_owned(),
                status: "in-review".to_owned(),
            },
            MemberDto {
                id: "member-3".to_owned(),
                name: "Ryo".to_owned(),
                role: "Engineer".to_owned(),
                focus: "Runtime test stabilization".to_owned(),
                status: "heads-down".to_owned(),
            },
        ],
        assistant_session: None,
    }
}
