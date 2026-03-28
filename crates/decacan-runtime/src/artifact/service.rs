use std::fmt::Debug;
use std::path::{Path, PathBuf};

use time::OffsetDateTime;
use uuid::Uuid;

use crate::artifact::entity::{Artifact, ArtifactKind, ArtifactStatus, ArtifactType};
use crate::artifact::relations::{
    artifact_relation_storage_key, ArtifactRelation, ArtifactRelationKind,
};
use crate::outputs::backup::{backup_existing_summary, BackupResult};
use crate::outputs::writer::{summary_output_path, write_discovery_output, write_summary_output};
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SummaryArtifactCommand {
    pub task_id: String,
    pub workspace_root: PathBuf,
    pub contents: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DiscoveryArtifactCommand {
    pub task_id: String,
    pub workspace_root: PathBuf,
    pub contents: String,
}

impl DiscoveryArtifactCommand {
    pub fn new(
        task_id: impl Into<String>,
        workspace_root: impl Into<PathBuf>,
        contents: impl Into<String>,
    ) -> Self {
        Self {
            task_id: task_id.into(),
            workspace_root: workspace_root.into(),
            contents: contents.into(),
        }
    }
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
    pub fn write_discovery_artifact(
        &self,
        command: DiscoveryArtifactCommand,
    ) -> Result<SummaryArtifactWriteResult, ArtifactServiceError> {
        let written_path =
            write_discovery_output(self.filesystem, &command.workspace_root, &command.contents)
                .map_err(|error| ArtifactServiceError::Filesystem(format!("{error:?}")))?;

        self.register_written_artifact(
            &command.task_id,
            &written_path,
            &ArtifactRegistrationSpec::discovery(),
            None,
        )
    }

    pub fn write_summary_artifact(
        &self,
        command: SummaryArtifactCommand,
    ) -> Result<SummaryArtifactWriteResult, ArtifactServiceError> {
        let summary_path = summary_output_path(&command.workspace_root);
        let backup_result =
            backup_existing_summary(self.filesystem, self.clock, &command.workspace_root, &summary_path)
                .map_err(|error| ArtifactServiceError::Filesystem(format!("{error:?}")))?;

        let written_path = write_summary_output(self.filesystem, &command.workspace_root, &command.contents)
            .map_err(|error| ArtifactServiceError::Filesystem(format!("{error:?}")))?;

        self.register_written_artifact(
            &command.task_id,
            &written_path,
            &ArtifactRegistrationSpec::summary(),
            backup_result,
        )
    }

    pub(crate) fn register_written_summary_artifacts(
        &self,
        task_id: &str,
        written_path: &Path,
        backup_result: Option<BackupResult>,
    ) -> Result<SummaryArtifactWriteResult, ArtifactServiceError> {
        self.register_written_artifact(
            task_id,
            written_path,
            &ArtifactRegistrationSpec::summary(),
            backup_result,
        )
    }

    pub(crate) fn register_written_discovery_artifact(
        &self,
        task_id: &str,
        written_path: &Path,
    ) -> Result<SummaryArtifactWriteResult, ArtifactServiceError> {
        self.register_written_artifact(
            task_id,
            written_path,
            &ArtifactRegistrationSpec::discovery(),
            None,
        )
    }

    fn register_written_artifact(
        &self,
        task_id: &str,
        written_path: &Path,
        spec: &ArtifactRegistrationSpec,
        backup_result: Option<BackupResult>,
    ) -> Result<SummaryArtifactWriteResult, ArtifactServiceError> {
        let now = self.clock.now_utc();
        let primary_artifact = build_primary_artifact(task_id, written_path, &spec.primary, now);
        let primary_storage_key = store_artifact(self.storage, &primary_artifact)?;

        let mut backup_artifact = None;
        let mut backup_storage_key = None;
        let mut relations = Vec::new();

        if let Some((backup_result, backup_spec)) = backup_result.zip(spec.backup.as_ref()) {
            let backup = build_backup_artifact(
                task_id,
                &backup_result.backup_path,
                &backup_result.backup_relative_path,
                &backup_result.backup_identity,
                backup_spec,
                now,
            );
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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct ArtifactDescriptor {
    id_suffix: &'static str,
    label: &'static str,
    logical_name: &'static str,
    canonical_path: &'static str,
    artifact_type: ArtifactType,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct BackupArtifactDescriptor {
    id_prefix: &'static str,
    label: &'static str,
    logical_name: &'static str,
    artifact_type: ArtifactType,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct ArtifactRegistrationSpec {
    primary: ArtifactDescriptor,
    backup: Option<BackupArtifactDescriptor>,
}

impl ArtifactRegistrationSpec {
    fn summary() -> Self {
        Self {
            primary: ArtifactDescriptor {
                id_suffix: "summary-primary",
                label: "summary",
                logical_name: "workspace.summary.primary",
                canonical_path: "output/summary.md",
                artifact_type: ArtifactType::Summary,
            },
            backup: Some(BackupArtifactDescriptor {
                id_prefix: "summary-backup",
                label: "summary-backup",
                logical_name: "workspace.summary.backup",
                artifact_type: ArtifactType::Summary,
            }),
        }
    }

    fn discovery() -> Self {
        Self {
            primary: ArtifactDescriptor {
                id_suffix: "discovery-primary",
                label: "discovery",
                logical_name: "workspace.discovery.primary",
                canonical_path: "output/discovery.md",
                artifact_type: ArtifactType::Discovery,
            },
            backup: None,
        }
    }
}

fn build_primary_artifact(
    task_id: &str,
    path: &Path,
    descriptor: &ArtifactDescriptor,
    now: OffsetDateTime,
) -> Artifact {
    Artifact {
        id: format!("artifact-{task_id}-{}", descriptor.id_suffix),
        task_id: task_id.to_owned(),
        label: descriptor.label.to_owned(),
        logical_name: descriptor.logical_name.to_owned(),
        canonical_path: descriptor.canonical_path.to_owned(),
        physical_path: path.to_string_lossy().to_string(),
        kind: ArtifactKind::Primary,
        status: ArtifactStatus::Ready,
        r#type: descriptor.artifact_type,
        created_at: now,
        updated_at: now,
        content_id: Uuid::new_v4(),
    }
}

fn build_backup_artifact(
    task_id: &str,
    path: &Path,
    relative_path: &Path,
    backup_identity: &str,
    descriptor: &BackupArtifactDescriptor,
    now: OffsetDateTime,
) -> Artifact {
    Artifact {
        id: format!("artifact-{task_id}-{}-{backup_identity}", descriptor.id_prefix),
        task_id: task_id.to_owned(),
        label: descriptor.label.to_owned(),
        logical_name: descriptor.logical_name.to_owned(),
        canonical_path: relative_path.to_string_lossy().to_string(),
        physical_path: path.to_string_lossy().to_string(),
        kind: ArtifactKind::Derived,
        status: ArtifactStatus::Ready,
        r#type: descriptor.artifact_type,
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
    let value = serde_json::to_string(artifact)
        .map_err(|error| ArtifactServiceError::Serialization(error.to_string()))?;
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
    let value = serde_json::to_string(relation)
        .map_err(|error| ArtifactServiceError::Serialization(error.to_string()))?;
    storage
        .put(&key, &value)
        .map_err(|error| ArtifactServiceError::Storage(format!("{error:?}")))?;
    Ok(())
}
