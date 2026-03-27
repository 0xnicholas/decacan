use super::entity::{Playbook, PlaybookStatus};
use super::modes::PlaybookMode;
use std::sync::OnceLock;
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

pub const SUMMARY_PLAYBOOK_KEY: &str = "总结资料";
pub const DISCOVER_TOPICS_PLAYBOOK_KEY: &str = "发现资料主题";

static REGISTERED_PLAYBOOKS: OnceLock<Vec<Playbook>> = OnceLock::new();

pub fn list_registered_playbooks() -> Vec<Playbook> {
    registry().to_vec()
}

pub fn get_registered_playbook(key: &str) -> Option<Playbook> {
    registry()
        .into_iter()
        .cloned()
        .find(|playbook| playbook.key == key)
}

fn registry() -> &'static [Playbook] {
    REGISTERED_PLAYBOOKS.get_or_init(|| {
        vec![
            registered_playbook(
                "playbook-summary",
                SUMMARY_PLAYBOOK_KEY,
                "总结资料",
                PlaybookMode::Standard,
                "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                0,
            ),
            registered_playbook(
                "playbook-discover-topics",
                DISCOVER_TOPICS_PLAYBOOK_KEY,
                "发现资料主题",
                PlaybookMode::Discovery,
                "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
                1,
            ),
        ]
    })
}

fn registered_playbook(
    id: &str,
    key: &str,
    title: &str,
    mode: PlaybookMode,
    version_id: &str,
    created_at_offset_days: i64,
) -> Playbook {
    let created_at = OffsetDateTime::UNIX_EPOCH + Duration::days(created_at_offset_days);
    Playbook {
        id: id.to_owned(),
        workspace_id: "workspace-1".to_owned(),
        key: key.to_owned(),
        title: title.to_owned(),
        mode,
        status: PlaybookStatus::Published,
        created_at,
        updated_at: created_at,
        version_id: Uuid::parse_str(version_id).expect("registered playbook version id is valid"),
    }
}
