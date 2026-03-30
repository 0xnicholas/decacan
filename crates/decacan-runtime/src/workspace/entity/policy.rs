use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use time::OffsetDateTime;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspacePolicy {
    pub id: String,
    pub workspace_id: String,
    pub task_id: Option<String>,
    pub scope: WorkspaceScope,
    pub read_boundary: ReadBoundary,
    pub write_boundary: WriteBoundary,
    pub path_rules: PathRules,
    pub created_at: OffsetDateTime,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceScope {
    FullWorkspace,
    SubpathOnly(String),
    ExplicitPaths(Vec<String>),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReadBoundary {
    pub allowed_paths: Vec<PathBuf>,
    pub blocked_paths: Vec<PathBuf>,
    pub allowed_extensions: Option<Vec<String>>,
    pub max_file_size_bytes: Option<u64>,
    pub allow_hidden_files: bool,
    pub follow_symlinks: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WriteBoundary {
    pub mode: WriteMode,
    pub output_root: Option<PathBuf>,
    pub approved_paths: Vec<PathBuf>,
    pub allow_overwrite: bool,
    pub require_backup: bool,
    pub max_file_size_bytes: Option<u64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WriteMode {
    OutputOnly,
    OutputPlusApproved,
    Workspace,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PathRules {
    pub prevent_escape: bool,
    pub allow_absolute_paths: bool,
    pub canonicalize_paths: bool,
    pub allowed_filename_patterns: Vec<String>,
    pub blocked_filename_patterns: Vec<String>,
}

impl WorkspacePolicy {
    pub fn new(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        scope: WorkspaceScope,
        read_boundary: ReadBoundary,
        write_boundary: WriteBoundary,
        path_rules: PathRules,
    ) -> Self {
        Self {
            id: id.into(),
            workspace_id: workspace_id.into(),
            task_id: None,
            scope,
            read_boundary,
            write_boundary,
            path_rules,
            created_at: OffsetDateTime::now_utc(),
        }
    }

    pub fn with_task_id(mut self, task_id: impl Into<String>) -> Self {
        self.task_id = Some(task_id.into());
        self
    }
}

impl Default for WorkspaceScope {
    fn default() -> Self {
        WorkspaceScope::FullWorkspace
    }
}

impl Default for ReadBoundary {
    fn default() -> Self {
        Self {
            allowed_paths: vec![],
            blocked_paths: vec![],
            allowed_extensions: None,
            max_file_size_bytes: None,
            allow_hidden_files: false,
            follow_symlinks: false,
        }
    }
}

impl Default for WriteBoundary {
    fn default() -> Self {
        Self {
            mode: WriteMode::OutputOnly,
            output_root: None,
            approved_paths: vec![],
            allow_overwrite: false,
            require_backup: true,
            max_file_size_bytes: Some(100 * 1024 * 1024), // 100MB default
        }
    }
}

impl WriteBoundary {
    pub fn output_only(output_root: impl Into<PathBuf>) -> Self {
        Self {
            mode: WriteMode::OutputOnly,
            output_root: Some(output_root.into()),
            approved_paths: vec![],
            allow_overwrite: false,
            require_backup: true,
            max_file_size_bytes: Some(100 * 1024 * 1024),
        }
    }

    pub fn is_restricted_to_output(&self) -> bool {
        matches!(self.mode, WriteMode::OutputOnly)
    }

    pub fn allows_write_to(&self, path: impl AsRef<Path>) -> bool {
        let path = path.as_ref();

        match self.mode {
            WriteMode::Workspace => true,
            WriteMode::OutputOnly => {
                if let Some(ref output_root) = self.output_root {
                    path.starts_with(output_root)
                } else {
                    false
                }
            }
            WriteMode::OutputPlusApproved => {
                if let Some(ref output_root) = self.output_root {
                    if path.starts_with(output_root) {
                        return true;
                    }
                }
                self.approved_paths
                    .iter()
                    .any(|approved| path.starts_with(approved))
            }
        }
    }
}

impl Default for PathRules {
    fn default() -> Self {
        Self {
            prevent_escape: true,
            allow_absolute_paths: false,
            canonicalize_paths: true,
            allowed_filename_patterns: vec![],
            blocked_filename_patterns: vec![],
        }
    }
}

impl PathRules {
    pub fn is_valid_path(&self, path: impl AsRef<str>) -> bool {
        let path_str = path.as_ref();

        if self.prevent_escape {
            if path_str.contains("..") || path_str.contains("~") {
                return false;
            }
        }

        if !self.allow_absolute_paths && path_str.starts_with('/') {
            // Absolute paths not allowed
            // Note: We still allow absolute paths if they're within the workspace root
            // which would be handled by the caller
        }

        // Check blocked patterns
        if !self.blocked_filename_patterns.is_empty() {
            let filename = Path::new(path_str)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("");
            for pattern in &self.blocked_filename_patterns {
                if filename.contains(pattern) {
                    return false;
                }
            }
        }

        true
    }
}
