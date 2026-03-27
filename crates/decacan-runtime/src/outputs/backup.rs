use std::path::{Path, PathBuf};

use time::OffsetDateTime;

use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct BackupResult {
    pub backup_path: PathBuf,
    pub original_contents: String,
}

pub(crate) fn backup_existing_summary<F, C>(
    filesystem: &F,
    clock: &C,
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
    let backup_path = backup_output_path(
        summary_path
            .parent()
            .and_then(Path::parent)
            .expect("summary output path should include output directory"),
        clock.now_utc(),
    );
    filesystem.write_string(&backup_path, &original_contents)?;

    Ok(Some(BackupResult {
        backup_path,
        original_contents,
    }))
}

fn backup_output_path(workspace_root: &Path, timestamp: OffsetDateTime) -> PathBuf {
    workspace_root.join("output/backups").join(format!(
        "summary-{:04}{:02}{:02}T{:02}{:02}{:02}Z.md",
        timestamp.year(),
        u8::from(timestamp.month()),
        timestamp.day(),
        timestamp.hour(),
        timestamp.minute(),
        timestamp.second()
    ))
}
