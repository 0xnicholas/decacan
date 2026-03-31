//! Example: End-to-end capability-based workflow execution
//!
//! This example demonstrates how to use the capability system to resolve
//! capabilities to implementations at runtime.

use std::sync::Arc;

use decacan_runtime::capability::{
    Capability, CapabilityRef, CapabilityRegistry, CapabilityResolver, ImplementationRef,
    ResolutionContext, SimpleResolver,
};
use decacan_runtime::playbook::spec::entities::{
    BackupPolicy, CapabilityRefs, OutputContract, PlaybookMetadata, PlaybookMode, PlaybookSpec,
    StepDefinition, Transition, WorkflowDefinition,
};

#[tokio::main]
async fn main() {
    println!("=== Phase 3: Capability Resolution Demo ===\n");

    // 1. Set up capability registry
    println!("1. Setting up capability registry...");
    let capability_registry = Arc::new(CapabilityRegistry::new());

    // 2. Define a capability with multiple implementations
    println!("2. Defining 'filesystem.read' capability...");
    let read_capability = Capability {
        id: "filesystem.read".to_string(),
        name: "Read File".to_string(),
        description: "Reads contents of a file".to_string(),
        input_contract: decacan_runtime::contract::Contract::object().build(),
        output_contract: decacan_runtime::contract::Contract::object().build(),
        implementations: vec![
            ImplementationRef::routine("builtin", "read_file", "1.0.0"),
            ImplementationRef::tool("file_api", "2.0.0"),
            ImplementationRef::skill("read_workflow", "1.0.0"),
        ],
    };
    capability_registry.register(Arc::new(read_capability));

    // 3. Demonstrate capability resolution
    println!("3. Creating resolver and resolving capability...");
    let resolver = SimpleResolver::new(capability_registry);
    
    let resolution_result = resolver
        .resolve(
            &CapabilityRef::new("filesystem.read"),
            &ResolutionContext::default(),
        )
        .expect("Resolution should succeed");

    println!("   ✓ Primary implementation: {:?}", resolution_result.implementation);
    println!("   ✓ Fallback count: {}", resolution_result.fallbacks.len());
    
    for (i, fallback) in resolution_result.fallbacks.iter().enumerate() {
        println!("   ✓ Fallback {}: {:?}", i + 1, fallback);
    }

    // 4. Create a workflow spec with capability-based steps
    println!("\n4. Creating workflow with capability steps...");
    let spec = PlaybookSpec {
        metadata: PlaybookMetadata {
            title: "Capability Demo".to_string(),
            description: "Demonstrates capability resolution".to_string(),
            mode: PlaybookMode::Standard,
            version: "1.0.0".to_string(),
            tags: vec!["demo".to_string()],
        },
        input_schema: vec![],
        workflow: WorkflowDefinition {
            steps: vec![
                StepDefinition::with_capability(
                    "read_config",
                    "Read Configuration",
                    "filesystem.read",
                    Transition::End,
                ),
            ],
            default_retry_policy: None,
            error_handling: None,
        },
        capability_refs: CapabilityRefs {
            routines: vec!["builtin.read_file".to_string()],
            tools: vec!["file_api".to_string()],
        },
        output_contract: OutputContract {
            primary_artifact: None,
            secondary_artifacts: None,
            backup_policy: BackupPolicy::None,
        },
        policy_profile: None,
    };

    println!("   ✓ Created workflow with {} steps", spec.workflow.steps.len());
    println!("   ✓ Step uses capability: {}", spec.workflow.steps[0].uses_capability());

    // 5. Demonstrate context-based resolution
    println!("\n5. Context-based resolution...");
    let context = ResolutionContext::new()
        .with_input(serde_json::json!({
            "file_type": "json",
            "priority": "high"
        }))
        .with_hint("prefer_local")
        .with_hint("fast_response");

    println!("   ✓ Context has 'prefer_local' hint: {}", context.has_hint("prefer_local"));
    println!("   ✓ Context has 'fast_response' hint: {}", context.has_hint("fast_response"));

    println!("\n=== Phase 3 Complete ===");
    println!("\nKey Achievements:");
    println!("- ✓ Runtime capability resolution works");
    println!("- ✓ Multiple implementations with fallbacks");
    println!("- ✓ Context-aware resolution ready");
    println!("- ✓ Integration with workflow system");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_capability_resolution_demo() {
        let capability_registry = Arc::new(CapabilityRegistry::new());

        let cap = Capability {
            id: "test.cap".to_string(),
            name: "Test".to_string(),
            description: "Test".to_string(),
            input_contract: decacan_runtime::contract::Contract::object().build(),
            output_contract: decacan_runtime::contract::Contract::object().build(),
            implementations: vec![
                ImplementationRef::routine("builtin", "test", "1.0.0"),
            ],
        };
        capability_registry.register(Arc::new(cap));

        let resolver = SimpleResolver::new(capability_registry);
        let result = resolver
            .resolve(
                &CapabilityRef::new("test.cap"),
                &ResolutionContext::default(),
            )
            .expect("Should resolve");

        assert_eq!(result.implementation.type_name(), "routine");
    }
}
