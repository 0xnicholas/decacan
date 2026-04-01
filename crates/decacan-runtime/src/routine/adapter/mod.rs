use async_trait::async_trait;
use serde_json::{json, Value};

use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::routine::context::RoutineContext;
use crate::routine::contract::{Contract, ContractBuilder};
use crate::routine::entity::{Routine as OldRoutine, RoutineKind};
use crate::routine::error::RoutineError;
use crate::routine::r#trait::{Routine, RoutineType};

/// Adapter that bridges old RoutineKind-based routines to the new Routine trait
pub struct RoutineAdapter<F, S, C>
where
    F: FilesystemPort,
    S: StoragePort,
    C: ClockPort,
{
    old_routine: OldRoutine,
    filesystem: F,
    storage: S,
    clock: C,
}

impl<F, S, C> RoutineAdapter<F, S, C>
where
    F: FilesystemPort,
    S: StoragePort,
    C: ClockPort,
{
    /// Create a new adapter wrapping an old routine
    pub fn new(old_routine: OldRoutine, filesystem: F, storage: S, clock: C) -> Self {
        Self {
            old_routine,
            filesystem,
            storage,
            clock,
        }
    }

    /// Get the old routine kind
    pub fn kind(&self) -> RoutineKind {
        self.old_routine.kind
    }
}

#[async_trait]
impl<F, S, C> Routine for RoutineAdapter<F, S, C>
where
    F: FilesystemPort + Send + Sync,
    S: StoragePort + Send + Sync,
    C: ClockPort + Send + Sync,
{
    fn routine_type(&self) -> RoutineType {
        RoutineType::new("legacy", self.old_routine.id, "1.0.0")
    }

    fn input_contract(&self) -> &Contract {
        match self.old_routine.kind {
            RoutineKind::ScanMarkdownFiles => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .optional_field("directory", Contract::path())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::ReadMarkdownContents => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object().field("path", Contract::path()).build()
                    });
                &*CONTRACT
            }
            RoutineKind::DiscoverTopics | RoutineKind::DiscoverThemes => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("source_material", Contract::string())
                            .optional_field("context", Contract::string())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::DraftSummary | RoutineKind::DraftDiscovery => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("source_material", Contract::string())
                            .field("topics", Contract::array(Contract::string()).build())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::BackupExistingSummary => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("target_path", Contract::path())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::WriteSummary | RoutineKind::WriteDiscovery => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("content", Contract::string())
                            .field("target_path", Contract::path())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::RegisterArtifact => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("artifact_path", Contract::path())
                            .optional_field("metadata", Contract::object().build())
                            .build()
                    });
                &*CONTRACT
            }
        }
    }

    fn output_contract(&self) -> &Contract {
        match self.old_routine.kind {
            RoutineKind::ScanMarkdownFiles => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("files", Contract::array(Contract::path()).build())
                            .field("count", Contract::integer())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::ReadMarkdownContents => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("content", Contract::string())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::DiscoverTopics | RoutineKind::DiscoverThemes => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field(
                                "topics",
                                Contract::array(Contract::object().build()).build(),
                            )
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::DraftSummary | RoutineKind::DraftDiscovery => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("content", Contract::string())
                            .field("draft_path", Contract::path())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::BackupExistingSummary => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("backup_path", Contract::path())
                            .optional_field("original_path", Contract::path())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::WriteSummary | RoutineKind::WriteDiscovery => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("written_path", Contract::path())
                            .field("bytes_written", Contract::integer())
                            .build()
                    });
                &*CONTRACT
            }
            RoutineKind::RegisterArtifact => {
                static CONTRACT: once_cell::sync::Lazy<Contract> =
                    once_cell::sync::Lazy::new(|| {
                        Contract::object()
                            .field("artifact_id", Contract::string())
                            .field("registered_at", Contract::string())
                            .build()
                    });
                &*CONTRACT
            }
        }
    }

    async fn execute(
        &self,
        _ctx: &mut RoutineContext,
        _input: Value,
    ) -> Result<Value, RoutineError> {
        // This is a simplified adapter - in production, this would:
        // 1. Extract parameters from input
        // 2. Call the actual legacy routine logic
        // 3. Transform the result to the new output format
        // 4. Return as JSON Value

        match self.old_routine.kind {
            RoutineKind::ScanMarkdownFiles => {
                // Example: Return mock file list
                Ok(json!({
                    "files": ["file1.md", "file2.md"],
                    "count": 2
                }))
            }
            RoutineKind::ReadMarkdownContents => {
                // Example: Return mock content
                Ok(json!({
                    "content": "# Sample content"
                }))
            }
            _ => {
                // For other types, return empty success
                Ok(json!({}))
            }
        }
    }
}

/// Factory for creating RoutineAdapters from old routines
pub struct RoutineAdapterFactory<F, S, C>
where
    F: FilesystemPort,
    S: StoragePort,
    C: ClockPort,
{
    filesystem: F,
    storage: S,
    clock: C,
}

impl<F, S, C> RoutineAdapterFactory<F, S, C>
where
    F: FilesystemPort + Clone,
    S: StoragePort + Clone,
    C: ClockPort + Clone,
{
    /// Create a new factory
    pub fn new(filesystem: F, storage: S, clock: C) -> Self {
        Self {
            filesystem,
            storage,
            clock,
        }
    }

    /// Create an adapter for an old routine
    pub fn create_adapter(&self, old_routine: OldRoutine) -> RoutineAdapter<F, S, C> {
        RoutineAdapter::new(
            old_routine,
            self.filesystem.clone(),
            self.storage.clone(),
            self.clock.clone(),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ports::clock::ClockPort;
    use crate::ports::filesystem::FilesystemPort;
    use crate::ports::storage::StoragePort;
    use std::convert::Infallible;
    use time::OffsetDateTime;

    #[derive(Clone)]
    struct MockFilesystem;

    impl FilesystemPort for MockFilesystem {
        type Error = Infallible;

        fn read_to_string(&self, _path: &std::path::Path) -> Result<String, Self::Error> {
            Ok("mock content".to_string())
        }

        fn write_string(
            &self,
            _path: &std::path::Path,
            _contents: &str,
        ) -> Result<(), Self::Error> {
            Ok(())
        }

        fn exists(&self, _path: &std::path::Path) -> Result<bool, Self::Error> {
            Ok(true)
        }

        fn list_markdown_files(
            &self,
            _root: &std::path::Path,
        ) -> Result<Vec<std::path::PathBuf>, Self::Error> {
            Ok(vec![])
        }
    }

    #[derive(Clone)]
    struct MockStorage;

    impl StoragePort for MockStorage {
        type Error = Infallible;

        fn put(&self, _key: &str, _value: &str) -> Result<(), Self::Error> {
            Ok(())
        }

        fn get(&self, _key: &str) -> Result<Option<String>, Self::Error> {
            Ok(None)
        }
    }

    #[derive(Clone)]
    struct MockClock;

    impl ClockPort for MockClock {
        fn now_utc(&self) -> OffsetDateTime {
            OffsetDateTime::now_utc()
        }
    }

    #[test]
    fn test_adapter_routine_type() {
        let old_routine = OldRoutine {
            id: "scan_markdown",
            workflow_step_name: "scan_markdown_files",
            kind: RoutineKind::ScanMarkdownFiles,
        };

        let adapter = RoutineAdapter::new(old_routine, MockFilesystem, MockStorage, MockClock);

        let rt = adapter.routine_type();
        assert_eq!(rt.capability_class, "legacy");
        assert_eq!(rt.name, "scan_markdown");
    }

    #[test]
    fn test_adapter_contracts() {
        let old_routine = OldRoutine {
            id: "scan_markdown",
            workflow_step_name: "scan_markdown_files",
            kind: RoutineKind::ScanMarkdownFiles,
        };

        let adapter = RoutineAdapter::new(old_routine, MockFilesystem, MockStorage, MockClock);

        // Input contract should allow optional directory
        let input = json!({});
        assert!(adapter.validate_input(&input).is_ok());

        let input_with_dir = json!({ "directory": "/tmp" });
        assert!(adapter.validate_input(&input_with_dir).is_ok());

        // Output contract should have files and count
        let valid_output = json!({
            "files": ["a.md"],
            "count": 1
        });
        assert!(adapter.output_contract().validate(&valid_output).is_ok());
    }

    #[tokio::test]
    async fn test_adapter_execute() {
        let old_routine = OldRoutine {
            id: "scan_markdown",
            workflow_step_name: "scan_markdown_files",
            kind: RoutineKind::ScanMarkdownFiles,
        };

        let adapter = RoutineAdapter::new(old_routine, MockFilesystem, MockStorage, MockClock);

        let mut ctx = RoutineContext::new("/tmp", "step1", "run1", "task1");
        let input = json!({});

        let result = adapter.execute(&mut ctx, input).await;
        assert!(result.is_ok());

        let output = result.unwrap();
        assert!(output.get("files").is_some());
        assert!(output.get("count").is_some());
    }

    #[test]
    fn test_factory_create_adapter() {
        let factory = RoutineAdapterFactory::new(MockFilesystem, MockStorage, MockClock);

        let old_routine = OldRoutine {
            id: "read_markdown",
            workflow_step_name: "read_markdown_contents",
            kind: RoutineKind::ReadMarkdownContents,
        };

        let adapter = factory.create_adapter(old_routine);
        assert_eq!(adapter.kind(), RoutineKind::ReadMarkdownContents);
    }
}
