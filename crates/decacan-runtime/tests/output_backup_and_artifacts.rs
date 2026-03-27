use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use decacan_infra::filesystem::local::LocalFilesystem;
use decacan_infra::storage::memory::MemoryStorage;
use decacan_runtime::artifact::entity::{ArtifactKind, ArtifactType};
use decacan_runtime::artifact::relations::{artifact_relation_storage_key, ArtifactRelationKind};
use decacan_runtime::artifact::service::{ArtifactService, SummaryArtifactCommand};
use decacan_runtime::ports::clock::ClockPort;
use decacan_runtime::ports::filesystem::FilesystemPort;
use decacan_runtime::ports::storage::StoragePort;
use time::OffsetDateTime;

#[test]
fn overwriting_summary_creates_backup_and_registers_primary_and_backup_artifacts() {
    let filesystem = LocalFilesystem::new();
    let storage = MemoryStorage::new();
    let clock = FixedClock::new(
        OffsetDateTime::parse(
            "2024-01-02T03:04:05Z",
            &time::format_description::well_known::Rfc3339,
        )
        .expect("fixed clock timestamp should parse"),
    );
    let service = ArtifactService::new(&filesystem, &storage, &clock);
    let workspace_root = unique_test_dir("output-backup-and-artifacts");
    let summary_path = workspace_root.join("output/summary.md");

    filesystem
        .write_string(&summary_path, "old summary")
        .expect("fixture summary should be written");

    let result = service
        .write_summary_artifact(SummaryArtifactCommand::new(
            "task-1",
            &workspace_root,
            "new summary",
        ))
        .expect("summary artifact write should succeed");

    assert_eq!(
        filesystem
            .read_to_string(&summary_path)
            .expect("new summary should be readable"),
        "new summary"
    );
    assert_eq!(
        filesystem
            .read_to_string(Path::new(
                &result
                    .backup_artifact
                    .as_ref()
                    .expect("backup artifact")
                    .physical_path,
            ))
            .expect("backup summary should be readable"),
        "old summary"
    );

    assert_eq!(result.primary_artifact.kind, ArtifactKind::Primary);
    assert_eq!(result.primary_artifact.r#type, ArtifactType::Summary);
    assert_eq!(
        result.primary_artifact.physical_path,
        summary_path.to_string_lossy().to_string()
    );

    let backup_artifact = result.backup_artifact.expect("backup artifact should exist");
    assert_eq!(backup_artifact.kind, ArtifactKind::Derived);
    assert_eq!(backup_artifact.r#type, ArtifactType::Summary);
    assert_eq!(
        PathBuf::from(&backup_artifact.physical_path),
        workspace_root.join("output/backups/summary-20240102T030405Z.md")
    );

    assert_eq!(result.relations.len(), 1);
    let relation = &result.relations[0];
    assert_eq!(relation.kind, ArtifactRelationKind::BackupOf);
    assert_eq!(relation.from_artifact_id, backup_artifact.id);
    assert_eq!(relation.to_artifact_id, result.primary_artifact.id);

    let stored_primary = storage
        .get(&result.primary_storage_key)
        .expect("primary artifact should be stored")
        .expect("primary artifact record should exist");
    let stored_backup = storage
        .get(&result.backup_storage_key.expect("backup key should exist"))
        .expect("backup artifact should be stored")
        .expect("backup artifact record should exist");
    let stored_relation = storage
        .get(&artifact_relation_storage_key(relation))
        .expect("relation should be stored")
        .expect("relation record should exist");

    assert!(stored_primary.contains("\"kind\":\"primary\""));
    assert!(stored_backup.contains("\"kind\":\"derived\""));
    assert!(stored_relation.contains("\"kind\":\"backup_of\""));

    fs::remove_dir_all(workspace_root).expect("test workspace cleanup should succeed");
}

#[derive(Debug, Clone, Copy)]
struct FixedClock {
    now: OffsetDateTime,
}

impl FixedClock {
    fn new(now: OffsetDateTime) -> Self {
        Self { now }
    }
}

impl ClockPort for FixedClock {
    fn now_utc(&self) -> OffsetDateTime {
        self.now
    }
}

fn unique_test_dir(name: &str) -> PathBuf {
    let unique_suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_nanos();

    std::env::temp_dir().join(format!("{unique_suffix}-{name}"))
}
