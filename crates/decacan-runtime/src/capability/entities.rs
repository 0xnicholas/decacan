//! Capability entities
//!
//! This module defines the core types for the Capability abstraction layer:
//! - [`Capability`]: Represents something the system can do
//! - [`CapabilityRef`]: Reference to a capability
//! - [`ImplementationRef`]: Reference to a specific implementation (Routine/Tool/Skill)

use serde::{Deserialize, Serialize};

use crate::routine::contract::Contract;

/// A capability represents something a system can do
///
/// Capabilities abstract over specific implementations, allowing the system
/// to choose the best implementation based on context.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Capability {
    /// Unique identifier for this capability (e.g., "filesystem.read")
    pub id: String,

    /// Human-readable name
    pub name: String,

    /// Description of what this capability does
    pub description: String,

    /// Expected input structure
    pub input_contract: Contract,

    /// Expected output structure
    pub output_contract: Contract,

    /// Available implementations for this capability
    pub implementations: Vec<ImplementationRef>,
}

impl Capability {
    /// Create a new capability
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// let cap = Capability::new(
    ///     "filesystem.read",
    ///     "Read File",
    ///     "Read contents of a file",
    ///     input_contract,
    ///     output_contract,
    /// );
    /// ```
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        description: impl Into<String>,
        input_contract: Contract,
        output_contract: Contract,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            description: description.into(),
            input_contract,
            output_contract,
            implementations: Vec::new(),
        }
    }

    /// Add an implementation to this capability
    pub fn add_implementation(mut self, implementation: ImplementationRef) -> Self {
        self.implementations.push(implementation);
        self
    }
}

/// Reference to a capability
///
/// Used to refer to capabilities without carrying the full definition.
/// Can be used as keys in maps and for serialization.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CapabilityRef {
    /// Capability ID
    pub id: String,
}

impl CapabilityRef {
    /// Create a new capability reference
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// let cap_ref = CapabilityRef::new("filesystem.read");
    /// ```
    pub fn new(id: impl Into<String>) -> Self {
        Self { id: id.into() }
    }
}

/// Reference to a specific implementation of a capability
///
/// Implementation can be:
/// - Routine: Local code execution
/// - Tool: External API call
/// - Skill: Sub-workflow composition
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ImplementationRef {
    /// Routine implementation (local execution)
    Routine {
        /// Capability class (e.g., "builtin", "custom")
        class: String,
        /// Routine name
        name: String,
        /// Version
        version: String,
    },

    /// Tool implementation (external API)
    Tool {
        /// Tool name
        name: String,
        /// Version
        version: String,
    },

    /// Skill implementation (sub-workflow)
    Skill {
        /// Playbook ID containing the workflow
        playbook_id: String,
        /// Version
        version: String,
    },
}

impl ImplementationRef {
    /// Create a routine implementation reference
    pub fn routine(
        class: impl Into<String>,
        name: impl Into<String>,
        version: impl Into<String>,
    ) -> Self {
        Self::Routine {
            class: class.into(),
            name: name.into(),
            version: version.into(),
        }
    }

    /// Create a tool implementation reference
    pub fn tool(name: impl Into<String>, version: impl Into<String>) -> Self {
        Self::Tool {
            name: name.into(),
            version: version.into(),
        }
    }

    /// Create a skill implementation reference
    pub fn skill(playbook_id: impl Into<String>, version: impl Into<String>) -> Self {
        Self::Skill {
            playbook_id: playbook_id.into(),
            version: version.into(),
        }
    }

    /// Get the implementation type name
    pub fn type_name(&self) -> &'static str {
        match self {
            Self::Routine { .. } => "routine",
            Self::Tool { .. } => "tool",
            Self::Skill { .. } => "skill",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_contract() -> Contract {
        Contract::object().build()
    }

    #[test]
    fn test_capability_creation() {
        let capability = Capability::new(
            "filesystem.read",
            "Read File",
            "Read file contents",
            create_test_contract(),
            create_test_contract(),
        );

        assert_eq!(capability.id, "filesystem.read");
        assert_eq!(capability.name, "Read File");
        assert!(capability.implementations.is_empty());
    }

    #[test]
    fn test_capability_add_implementation() {
        let capability = Capability::new(
            "test.cap",
            "Test",
            "Test capability",
            create_test_contract(),
            create_test_contract(),
        )
        .add_implementation(ImplementationRef::routine("builtin", "test", "1.0.0"));

        assert_eq!(capability.implementations.len(), 1);
    }

    #[test]
    fn test_capability_ref() {
        let cap_ref = CapabilityRef::new("filesystem.read");
        assert_eq!(cap_ref.id, "filesystem.read");
    }

    #[test]
    fn test_implementation_ref_routine() {
        let routine = ImplementationRef::routine("builtin", "read_file", "1.0.0");

        match routine {
            ImplementationRef::Routine {
                class,
                name,
                version,
            } => {
                assert_eq!(class, "builtin");
                assert_eq!(name, "read_file");
                assert_eq!(version, "1.0.0");
            }
            _ => panic!("Expected Routine variant"),
        }

        assert_eq!(routine.type_name(), "routine");
    }

    #[test]
    fn test_implementation_ref_tool() {
        let tool = ImplementationRef::tool("http_api", "1.0.0");

        match tool {
            ImplementationRef::Tool { name, version } => {
                assert_eq!(name, "http_api");
                assert_eq!(version, "1.0.0");
            }
            _ => panic!("Expected Tool variant"),
        }

        assert_eq!(tool.type_name(), "tool");
    }

    #[test]
    fn test_implementation_ref_skill() {
        let skill = ImplementationRef::skill("sub_workflow", "1.0.0");

        match skill {
            ImplementationRef::Skill {
                playbook_id,
                version,
            } => {
                assert_eq!(playbook_id, "sub_workflow");
                assert_eq!(version, "1.0.0");
            }
            _ => panic!("Expected Skill variant"),
        }

        assert_eq!(skill.type_name(), "skill");
    }
}
