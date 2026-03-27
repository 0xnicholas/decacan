use std::path::{Path, PathBuf};

use crate::ports::filesystem::FilesystemPort;

pub(crate) fn summary_output_path(workspace_root: &Path) -> PathBuf {
    workspace_root.join("output/summary.md")
}

pub(crate) fn write_summary_output<F>(
    filesystem: &F,
    workspace_root: &Path,
    contents: &str,
) -> Result<PathBuf, F::Error>
where
    F: FilesystemPort,
{
    let output_path = summary_output_path(workspace_root);
    filesystem.write_string(&output_path, contents)?;
    Ok(output_path)
}
