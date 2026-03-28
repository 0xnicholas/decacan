use std::path::{Path, PathBuf};

use time::OffsetDateTime;
use uuid::Uuid;

use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct BackupResult {
    pub backup_path: PathBuf,
    pub backup_relative_path: PathBuf,
    pub backup_identity: String,
}

pub(crate) fn backup_existing_summary<F, C>(
    filesystem: &F,
    clock: &C,
    workspace_root: &Path,
    summary_path: &Path,
) -> Result<Option<BackupResult>, F::Error>
where
    F: FilesystemPort,
    C: ClockPort,
{
    if !filesystem.exists(summary_path)? {
        return Ok(None);
    }

    let original_contents = filesystem.read_to_string(summary_path)?;
    let backup_identity = Uuid::new_v4().simple().to_string();
    let backup_relative_path = backup_output_relative_path(clock.now_utc(), &backup_identity);
    let backup_path = workspace_root.join(&backup_relative_path);
    filesystem.write_string(&backup_path, &original_contents)?;

    Ok(Some(BackupResult {
        backup_path,
        backup_relative_path,
        backup_identity,
    }))
}

pub(crate) fn backup_from_existing_summary<F, C>(
    filesystem: &F,
    clock: &C,
    workspace_root: &Path,
) -> Result<Option<BackupResult>, F::Error>
where
    F: FilesystemPort,
    C: ClockPort,
{
    backup_existing_summary(
        filesystem,
        clock,
        workspace_root,
        &workspace_root.join("output/summary.md"),
    )
}

fn backup_output_relative_path(timestamp: OffsetDateTime, backup_identity: &str) -> PathBuf {
    PathBuf::from("output/backups").join(format!(
        "summary-{:04}{:02}{:02}T{:02}{:02}{:02}Z-{}.md",
        timestamp.year(),
        u8::from(timestamp.month()),
        timestamp.day(),
        timestamp.hour(),
        timestamp.minute(),
        timestamp.second(),
        backup_identity
    ))
}
