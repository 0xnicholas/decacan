use std::fmt::Debug;
use std::path::{Path, PathBuf};

use time::OffsetDateTime;
use uuid::Uuid;

use crate::artifact::entity::{Artifact, ArtifactKind, ArtifactStatus, ArtifactType};
use crate::artifact::relations::{
    artifact_relation_storage_key, ArtifactRelation, ArtifactRelationKind,
};
use crate::outputs::backup::backup_existing_summary;
use crate::outputs::writer::{summary_output_path, write_summary_output};
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SummaryArtifactCommand {
    pub task_id: String,
    pub workspace_root: PathBuf,
    pub contents: String,
}

impl SummaryArtifactCommand {
    pub fn new(task_id: impl Into<String>, workspace_root: impl Into<PathBuf>, contents: impl Into<String>) -> Self {
        Self {
            task_id: task_id.into(),
            workspace_root: workspace_root.into(),
            contents: contents.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SummaryArtifactWriteResult {
    pub primary_artifact: Artifact,
    pub backup_artifact: Option<Artifact>,
    pub relations: Vec<ArtifactRelation>,
    pub primary_storage_key: String,
    pub backup_storage_key: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ArtifactServiceError {
    Filesystem(String),
    Storage(String),
    Serialization(String),
}

pub struct ArtifactService<'a, F, S, C> {
    filesystem: &'a F,
    storage: &'a S,
    clock: &'a C,
}

impl<'a, F, S, C> ArtifactService<'a, F, S, C> {
    pub fn new(filesystem: &'a F, storage: &'a S, clock: &'a C) -> Self {
        Self {
            filesystem,
            storage,
            clock,
        }
    }
}

impl<'a, F, S, C> ArtifactService<'a, F, S, C>
where
    F: FilesystemPort,
    F::Error: Debug,
    S: StoragePort,
    S::Error: Debug,
    C: ClockPort,
{
    pub fn write_summary_artifact(
        &self,
        command: SummaryArtifactCommand,
    ) -> Result<SummaryArtifactWriteResult, ArtifactServiceError> {
        let summary_path = summary_output_path(&command.workspace_root);
        let backup_result = backup_existing_summary(self.filesystem, self.clock, &summary_path)
            .map_err(|error| ArtifactServiceError::Filesystem(format!("{error:?}")))?;

        let written_path = write_summary_output(self.filesystem, &command.workspace_root, &command.contents)
            .map_err(|error| ArtifactServiceError::Filesystem(format!("{error:?}")))?;

        let now = self.clock.now_utc();
        let primary_artifact = build_primary_artifact(&command.task_id, &written_path, now);
        let primary_storage_key = store_artifact(self.storage, &primary_artifact)?;

        let mut backup_artifact = None;
        let mut backup_storage_key = None;
        let mut relations = Vec::new();

        if let Some(backup_result) = backup_result {
            let backup = build_backup_artifact(&command.task_id, &backup_result.backup_path, now);
            let relation = ArtifactRelation {
                id: format!("artifact-relation-{}-backup-of-{}", backup.id, primary_artifact.id),
                from_artifact_id: backup.id.clone(),
                to_artifact_id: primary_artifact.id.clone(),
                kind: ArtifactRelationKind::BackupOf,
            };
            let stored_backup_key = store_artifact(self.storage, &backup)?;
            store_relation(self.storage, &relation)?;

            backup_storage_key = Some(stored_backup_key);
            backup_artifact = Some(backup);
            relations.push(relation);
        }

        Ok(SummaryArtifactWriteResult {
            primary_artifact,
            backup_artifact,
            relations,
            primary_storage_key,
            backup_storage_key,
        })
    }
}

fn build_primary_artifact(task_id: &str, path: &Path, now: OffsetDateTime) -> Artifact {
    Artifact {
        id: format!("artifact-{task_id}-summary-primary"),
        task_id: task_id.to_owned(),
        label: "summary".to_owned(),
        logical_name: "workspace.summary.primary".to_owned(),
        canonical_path: "output/summary.md".to_owned(),
        physical_path: path.to_string_lossy().to_string(),
        kind: ArtifactKind::Primary,
        status: ArtifactStatus::Ready,
        r#type: ArtifactType::Summary,
        created_at: now,
        updated_at: now,
        content_id: Uuid::new_v4(),
    }
}

fn build_backup_artifact(task_id: &str, path: &Path, now: OffsetDateTime) -> Artifact {
    Artifact {
        id: format!("artifact-{task_id}-summary-backup-{}", now.unix_timestamp()),
        task_id: task_id.to_owned(),
        label: "summary-backup".to_owned(),
        logical_name: "workspace.summary.backup".to_owned(),
        canonical_path: path
            .strip_prefix(
                path.ancestors()
                    .nth(3)
                    .expect("backup path should live below workspace root"),
            )
            .unwrap_or(path)
            .to_string_lossy()
            .to_string(),
        physical_path: path.to_string_lossy().to_string(),
        kind: ArtifactKind::Derived,
        status: ArtifactStatus::Ready,
        r#type: ArtifactType::Summary,
        created_at: now,
        updated_at: now,
        content_id: Uuid::new_v4(),
    }
}

fn store_artifact<S>(storage: &S, artifact: &Artifact) -> Result<String, ArtifactServiceError>
where
    S: StoragePort,
    S::Error: Debug,
{
    let key = format!("artifact/{}", artifact.id);
    let value = artifact_record_json(artifact);
    storage
        .put(&key, &value)
        .map_err(|error| ArtifactServiceError::Storage(format!("{error:?}")))?;
    Ok(key)
}

fn store_relation<S>(storage: &S, relation: &ArtifactRelation) -> Result<(), ArtifactServiceError>
where
    S: StoragePort,
    S::Error: Debug,
{
    let key = artifact_relation_storage_key(relation);
    let value = relation_record_json(relation);
    storage
        .put(&key, &value)
        .map_err(|error| ArtifactServiceError::Storage(format!("{error:?}")))?;
    Ok(())
}

fn artifact_record_json(artifact: &Artifact) -> String {
    format!(
        "{{\"id\":\"{}\",\"task_id\":\"{}\",\"label\":\"{}\",\"logical_name\":\"{}\",\"canonical_path\":\"{}\",\"physical_path\":\"{}\",\"kind\":\"{}\",\"status\":\"{}\",\"type\":\"{}\",\"created_at\":\"{}\",\"updated_at\":\"{}\",\"content_id\":\"{}\"}}",
        artifact.id,
        artifact.task_id,
        artifact.label,
        artifact.logical_name,
        artifact.canonical_path,
        artifact.physical_path,
        artifact_kind_name(artifact.kind),
        artifact_status_name(artifact.status),
        artifact_type_name(artifact.r#type),
        artifact.created_at,
        artifact.updated_at,
        artifact.content_id
    )
}

fn relation_record_json(relation: &ArtifactRelation) -> String {
    format!(
        "{{\"id\":\"{}\",\"from_artifact_id\":\"{}\",\"to_artifact_id\":\"{}\",\"kind\":\"{}\"}}",
        relation.id,
        relation.from_artifact_id,
        relation.to_artifact_id,
        relation_kind_name(relation.kind)
    )
}

fn artifact_kind_name(kind: ArtifactKind) -> &'static str {
    match kind {
        ArtifactKind::Primary => "primary",
        ArtifactKind::Derived => "derived",
        ArtifactKind::Attachment => "attachment",
    }
}

fn artifact_status_name(status: ArtifactStatus) -> &'static str {
    match status {
        ArtifactStatus::Pending => "pending",
        ArtifactStatus::Ready => "ready",
        ArtifactStatus::Archived => "archived",
        ArtifactStatus::Failed => "failed",
    }
}

fn artifact_type_name(artifact_type: ArtifactType) -> &'static str {
    match artifact_type {
        ArtifactType::Summary => "summary",
        ArtifactType::Report => "report",
        ArtifactType::Log => "log",
        ArtifactType::Dataset => "dataset",
        ArtifactType::Binary => "binary",
    }
}

fn relation_kind_name(kind: ArtifactRelationKind) -> &'static str {
    match kind {
        ArtifactRelationKind::BackupOf => "backup_of",
    }
}
