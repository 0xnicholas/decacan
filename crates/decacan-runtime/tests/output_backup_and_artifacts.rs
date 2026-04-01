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
            "task-\"quoted\"",
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

    let backup_artifact = result
        .backup_artifact
        .expect("backup artifact should exist");
    assert_eq!(backup_artifact.kind, ArtifactKind::Derived);
    assert_eq!(backup_artifact.r#type, ArtifactType::Summary);
    let backup_file_name = Path::new(&backup_artifact.physical_path)
        .file_name()
        .expect("backup file should have a file name")
        .to_string_lossy()
        .to_string();
    assert!(backup_file_name.starts_with("summary-20240102T030405Z-"));
    assert!(backup_file_name.ends_with(".md"));
    assert_eq!(
        PathBuf::from(&backup_artifact.physical_path),
        workspace_root
            .join("output/backups")
            .join(&backup_file_name)
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
    let stored_primary_artifact: decacan_runtime::artifact::entity::Artifact =
        serde_json::from_str(&stored_primary).expect("primary artifact record should deserialize");
    let stored_backup_artifact: decacan_runtime::artifact::entity::Artifact =
        serde_json::from_str(&stored_backup).expect("backup artifact record should deserialize");
    let stored_backup_relation: decacan_runtime::artifact::relations::ArtifactRelation =
        serde_json::from_str(&stored_relation).expect("relation record should deserialize");

    assert!(stored_primary.contains("\"kind\":\"primary\""));
    assert!(stored_backup.contains("\"kind\":\"derived\""));
    assert!(stored_relation.contains("\"kind\":\"backup_of\""));
    assert_eq!(stored_primary_artifact.id, result.primary_artifact.id);
    assert_eq!(stored_backup_artifact.id, backup_artifact.id);
    assert_eq!(stored_backup_relation.id, relation.id);
    assert_eq!(
        backup_artifact.canonical_path,
        format!("output/backups/{backup_file_name}")
    );

    fs::remove_dir_all(workspace_root).expect("test workspace cleanup should succeed");
}

#[test]
fn repeated_overwrites_in_same_second_produce_distinct_backup_paths_and_ids() {
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
    let workspace_root = unique_test_dir("output-backup-and-artifacts-repeat");
    let summary_path = workspace_root.join("output/summary.md");

    filesystem
        .write_string(&summary_path, "first summary")
        .expect("fixture summary should be written");

    let first = service
        .write_summary_artifact(SummaryArtifactCommand::new(
            "task-1",
            &workspace_root,
            "second summary",
        ))
        .expect("first overwrite should succeed");
    let second = service
        .write_summary_artifact(SummaryArtifactCommand::new(
            "task-1",
            &workspace_root,
            "third summary",
        ))
        .expect("second overwrite should succeed");

    let first_backup = first.backup_artifact.expect("first backup should exist");
    let second_backup = second.backup_artifact.expect("second backup should exist");

    assert_ne!(first_backup.id, second_backup.id);
    assert_ne!(first_backup.physical_path, second_backup.physical_path);
    assert_eq!(
        filesystem
            .read_to_string(Path::new(&first_backup.physical_path))
            .expect("first backup should be readable"),
        "first summary"
    );
    assert_eq!(
        filesystem
            .read_to_string(Path::new(&second_backup.physical_path))
            .expect("second backup should be readable"),
        "second summary"
    );

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
