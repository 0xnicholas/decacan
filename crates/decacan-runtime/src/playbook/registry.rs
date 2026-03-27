use super::entity::{Playbook, PlaybookStatus};
use super::modes::PlaybookMode;

pub const SUMMARY_PLAYBOOK_KEY: &str = "总结资料";
pub const DISCOVER_TOPICS_PLAYBOOK_KEY: &str = "发现资料主题";

pub fn registered_playbooks_for_test() -> Vec<Playbook> {
    vec![
        registered_playbook(
            "playbook-summary",
            SUMMARY_PLAYBOOK_KEY,
            "总结资料",
            PlaybookMode::Standard,
        ),
        registered_playbook(
            "playbook-discover-topics",
            DISCOVER_TOPICS_PLAYBOOK_KEY,
            "发现资料主题",
            PlaybookMode::Discovery,
        ),
    ]
}

pub fn find_registered_playbook_for_test(key: &str) -> Option<Playbook> {
    registered_playbooks_for_test()
        .into_iter()
        .find(|playbook| playbook.key == key)
}

fn registered_playbook(id: &str, key: &str, title: &str, mode: PlaybookMode) -> Playbook {
    let mut playbook = Playbook::new_for_test(id, "workspace-1", key, mode);
    playbook.title = title.to_owned();
    playbook.status = PlaybookStatus::Published;
    playbook
}
