use std::path::{Path, PathBuf};

use crate::ports::filesystem::FilesystemPort;

pub(crate) fn output_path(workspace_root: &Path, canonical_path: &str) -> PathBuf {
    workspace_root.join(canonical_path)
}

pub(crate) fn summary_output_path(workspace_root: &Path) -> PathBuf {
    output_path(workspace_root, "output/summary.md")
}

pub(crate) fn write_output<F>(
    filesystem: &F,
    workspace_root: &Path,
    canonical_path: &str,
    contents: &str,
) -> Result<PathBuf, F::Error>
where
    F: FilesystemPort,
{
    let output_path = output_path(workspace_root, canonical_path);
    filesystem.write_string(&output_path, contents)?;
    Ok(output_path)
}

pub(crate) fn write_summary_output<F>(
    filesystem: &F,
    workspace_root: &Path,
    contents: &str,
) -> Result<PathBuf, F::Error>
where
    F: FilesystemPort,
{
    write_output(filesystem, workspace_root, "output/summary.md", contents)
}

pub(crate) fn write_discovery_output<F>(
    filesystem: &F,
    workspace_root: &Path,
    contents: &str,
) -> Result<PathBuf, F::Error>
where
    F: FilesystemPort,
{
    write_output(filesystem, workspace_root, "output/discovery.md", contents)
}
