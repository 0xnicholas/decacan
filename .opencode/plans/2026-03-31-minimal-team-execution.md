# Minimal Team Execution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Minimal Team Execution support in decacan-runtime, enabling parallel role group execution with merge aggregation while maintaining runtime-mediated collaboration (no direct agent communication).

**Architecture:** Add TeamSpec Registry for role definitions, extend Workflow with ParallelRoleGroup and Merge step types, implement RoleAssignment tracking and MergeInputBundle aggregation. Team execution remains within existing Run lifecycle with runtime controlling all coordination.

**Tech Stack:** Rust, SQLite for persistence, serde for serialization, existing decacan-runtime patterns

**Reference Spec:** `docs/superpowers/specs/2026-03-29-decacan-minimal-team-execution-spec.md`

---

## File Structure Overview

```
crates/decacan-runtime/src/
├── team/                          # NEW: Team execution module
│   ├── mod.rs                     # Module exports
│   ├── entity.rs                  # TeamSpec, Role entities
│   ├── registry.rs                # TeamSpecRegistry trait + impl
│   ├── builtin.rs                 # Built-in team specs
│   └── assignment.rs              # RoleAssignment entity
├── workflow/
│   ├── step.rs                    # MODIFY: Add ParallelRoleGroup, Merge
│   └── compiler.rs                # MODIFY: Compile team steps
├── run/
│   ├── entity.rs                  # MODIFY: Add team execution state
│   └── service.rs                 # MODIFY: Execute team path
└── merge/                         # NEW: Merge aggregation module
    ├── mod.rs
    ├── bundle.rs                  # MergeInputBundle
    └── strategies.rs              # Merge strategies (all_required, etc.)

crates/decacan-runtime/tests/
└── team_execution.rs              # NEW: Integration tests
```

---

## Phase 1: TeamSpec Registry Foundation

### Task 1: Role Entity Definition

**Files:**
- Create: `crates/decacan-runtime/src/team/entity.rs`
- Test: `crates/decacan-runtime/tests/team_entity_test.rs`

**Description:** Define the Role entity structure representing a team member role with responsibilities and capabilities.

- [ ] **Step 1: Write the failing test**

```rust
// tests/team_entity_test.rs
use decacan_runtime::team::entity::{Role, RoleId};

#[test]
fn role_can_be_created_with_required_fields() {
    let role = Role::new(
        RoleId::new("scout"),
        "Scout",
        "Gathers initial information and context",
    )
    .with_allowed_routines(vec!["scan_markdown".to_string()])
    .with_synthesis_profile("exploration");

    assert_eq!(role.id().as_str(), "scout");
    assert_eq!(role.title(), "Scout");
    assert!(role.allowed_routines().contains("scan_markdown"));
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/nicholasl/Documents/build-whatever/decacan
cargo test -p decacan-runtime team_entity_test --lib 2>&1 | head -20
```

Expected: FAIL - "cannot find module `team`"

- [ ] **Step 3: Create minimal implementation**

```rust
// src/team/mod.rs
pub mod entity;

// src/team/entity.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RoleId(String);

impl RoleId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    id: RoleId,
    title: String,
    responsibility: String,
    allowed_routines: Vec<String>,
    synthesis_profile: Option<String>,
}

impl Role {
    pub fn new(id: RoleId, title: impl Into<String>, responsibility: impl Into<String>) -> Self {
        Self {
            id,
            title: title.into(),
            responsibility: responsibility.into(),
            allowed_routines: Vec::new(),
            synthesis_profile: None,
        }
    }

    pub fn with_allowed_routines(mut self, routines: Vec<String>) -> Self {
        self.allowed_routines = routines;
        self
    }

    pub fn with_synthesis_profile(mut self, profile: impl Into<String>) -> Self {
        self.synthesis_profile = Some(profile.into());
        self
    }

    pub fn id(&self) -> &RoleId {
        &self.id
    }

    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn allowed_routines(&self) -> &[String] {
        &self.allowed_routines
    }
}
```

- [ ] **Step 4: Add module to lib.rs**

```rust
// src/lib.rs - add after synthesis module
pub mod team;
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cargo test -p decacan-runtime team_entity_test --lib 2>&1 | tail -10
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-runtime/src/team/mod.rs \
    crates/decacan-runtime/src/team/entity.rs \
    crates/decacan-runtime/tests/team_entity_test.rs \
    crates/decacan-runtime/src/lib.rs
git commit -m "feat(team): add Role entity definition"
```

---

### Task 2: TeamSpec Entity Definition

**Files:**
- Modify: `crates/decacan-runtime/src/team/entity.rs`
- Test: `crates/decacan-runtime/tests/team_entity_test.rs`

**Description:** Define the TeamSpec entity representing a team composition with multiple roles and a lead role.

- [ ] **Step 1: Write the failing test**

```rust
// tests/team_entity_test.rs
use decacan_runtime::team::entity::{Role, RoleId, TeamSpec, TeamSpecId};

#[test]
fn team_spec_can_be_created_with_roles() {
    let scout = Role::new(
        RoleId::new("scout"),
        "Scout",
        "Gathers information",
    );
    
    let synthesizer = Role::new(
        RoleId::new("synthesizer"),
        "Synthesizer", 
        "Combines information",
    );

    let team = TeamSpec::new(
        TeamSpecId::new("research-team"),
        "Research Team",
        "A team for research tasks",
    )
    .with_version("1.0.0")
    .with_provider("builtin")
    .add_role(scout)
    .add_role(synthesizer)
    .with_lead_role(RoleId::new("synthesizer"));

    assert_eq!(team.id().as_str(), "research-team");
    assert_eq!(team.roles().len(), 2);
    assert_eq!(team.lead_role().as_str(), "synthesizer");
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cargo test -p decacan-runtime team_spec_can_be_created --lib 2>&1 | head -15
```

Expected: FAIL - "cannot find type `TeamSpec`"

- [ ] **Step 3: Implement TeamSpec entity**

```rust
// src/team/entity.rs - add after Role

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TeamSpecId(String);

impl TeamSpecId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamSpec {
    id: TeamSpecId,
    title: String,
    summary: String,
    version: String,
    provider: String,
    roles: Vec<Role>,
    lead_role: RoleId,
    compatibility: Vec<String>,
}

impl TeamSpec {
    pub fn new(id: TeamSpecId, title: impl Into<String>, summary: impl Into<String>) -> Self {
        Self {
            id,
            title: title.into(),
            summary: summary.into(),
            version: "1.0.0".to_string(),
            provider: "builtin".to_string(),
            roles: Vec::new(),
            lead_role: RoleId::new(""), // placeholder, must be set
            compatibility: Vec::new(),
        }
    }

    pub fn with_version(mut self, version: impl Into<String>) -> Self {
        self.version = version.into();
        self
    }

    pub fn with_provider(mut self, provider: impl Into<String>) -> Self {
        self.provider = provider.into();
        self
    }

    pub fn add_role(mut self, role: Role) -> Self {
        self.roles.push(role);
        self
    }

    pub fn with_lead_role(mut self, lead_role: RoleId) -> Self {
        self.lead_role = lead_role;
        self
    }

    pub fn id(&self) -> &TeamSpecId {
        &self.id
    }

    pub fn roles(&self) -> &[Role] {
        &self.roles
    }

    pub fn lead_role(&self) -> &RoleId {
        &self.lead_role
    }

    pub fn version(&self) -> &str {
        &self.version
    }

    pub fn provider(&self) -> &str {
        &self.provider
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cargo test -p decacan-runtime team_spec_can_be_created --lib
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/team/entity.rs \
    crates/decacan-runtime/tests/team_entity_test.rs
git commit -m "feat(team): add TeamSpec entity with roles and lead role"
```

---

### Task 3: TeamSpecRegistry Trait

**Files:**
- Create: `crates/decacan-runtime/src/team/registry.rs`
- Test: `crates/decacan-runtime/tests/team_registry_test.rs`

**Description:** Define the TeamSpecRegistry trait for resolving and validating team specs.

- [ ] **Step 1: Write the failing test**

```rust
// tests/team_registry_test.rs
use decacan_runtime::team::entity::{Role, RoleId, TeamSpec, TeamSpecId};
use decacan_runtime::team::registry::{TeamSpecRegistry, InMemoryTeamSpecRegistry};

#[test]
fn registry_can_resolve_team_spec() {
    let registry = create_test_registry();
    
    let team = registry.resolve(&TeamSpecId::new("research-team"))
        .expect("should find team");
    
    assert_eq!(team.id().as_str(), "research-team");
}

fn create_test_registry() -> InMemoryTeamSpecRegistry {
    let mut registry = InMemoryTeamSpecRegistry::new();
    
    let team = TeamSpec::new(
        TeamSpecId::new("research-team"),
        "Research Team",
        "For research tasks",
    )
    .with_lead_role(RoleId::new("synthesizer"));
    
    registry.register(team);
    registry
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cargo test -p decacan-runtime registry_can_resolve --lib 2>&1 | head -15
```

Expected: FAIL - "cannot find trait `TeamSpecRegistry`"

- [ ] **Step 3: Implement TeamSpecRegistry trait**

```rust
// src/team/registry.rs
use std::collections::HashMap;
use crate::team::entity::{TeamSpec, TeamSpecId};

pub trait TeamSpecRegistry {
    fn resolve(&self, id: &TeamSpecId) -> Option<TeamSpec>;
    fn list_available(&self) -> Vec<&TeamSpecId>;
}

#[derive(Debug, Default)]
pub struct InMemoryTeamSpecRegistry {
    specs: HashMap<String, TeamSpec>,
}

impl InMemoryTeamSpecRegistry {
    pub fn new() -> Self {
        Self {
            specs: HashMap::new(),
        }
    }

    pub fn register(&mut self, spec: TeamSpec) {
        self.specs.insert(spec.id().as_str().to_string(), spec);
    }
}

impl TeamSpecRegistry for InMemoryTeamSpecRegistry {
    fn resolve(&self, id: &TeamSpecId) -> Option<TeamSpec> {
        self.specs.get(id.as_str()).cloned()
    }

    fn list_available(&self) -> Vec<&TeamSpecId> {
        self.specs.values()
            .map(|s| s.id())
            .collect()
    }
}
```

- [ ] **Step 4: Export from team/mod.rs**

```rust
// src/team/mod.rs
pub mod entity;
pub mod registry;
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cargo test -p decacan-runtime registry_can_resolve --lib
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-runtime/src/team/registry.rs \
    crates/decacan-runtime/src/team/mod.rs \
    crates/decacan-runtime/tests/team_registry_test.rs
git commit -m "feat(team): add TeamSpecRegistry trait with in-memory implementation"
```

---

## Phase 2: Workflow Extension for Team Execution

### Task 4: Add ParallelRoleGroup Step Type

**Files:**
- Modify: `crates/decacan-runtime/src/workflow/step.rs`
- Test: `crates/decacan-runtime/tests/workflow_team_step_test.rs`

**Description:** Extend WorkflowStepType to support ParallelRoleGroup for team execution.

- [ ] **Step 1: Write the failing test**

```rust
// tests/workflow_team_step_test.rs
use decacan_runtime::workflow::step::{WorkflowStepType, ParallelRoleGroupConfig};
use decacan_runtime::team::entity::TeamSpecId;

#[test]
fn workflow_step_can_be_parallel_role_group() {
    let team_id = TeamSpecId::new("research-team");
    let config = ParallelRoleGroupConfig::new(team_id.clone());
    
    let step_type = WorkflowStepType::ParallelRoleGroup(config);
    
    match step_type {
        WorkflowStepType::ParallelRoleGroup(cfg) => {
            assert_eq!(cfg.team_spec_id().as_str(), "research-team");
        }
        _ => panic!("Expected ParallelRoleGroup variant"),
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cargo test -p decacan-runtime workflow_step_can_be_parallel --lib 2>&1 | head -15
```

Expected: FAIL - "cannot find variant `ParallelRoleGroup`"

- [ ] **Step 3: Add ParallelRoleGroup to WorkflowStepType**

```rust
// src/workflow/step.rs
use crate::team::entity::TeamSpecId;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WorkflowStepType {
    Deterministic,
    Tool,
    Routine,
    Synthesis,
    Approval,
    Branch,
    ParallelRoleGroup(ParallelRoleGroupConfig),  // NEW
    Merge(MergeConfig),                           // NEW
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelRoleGroupConfig {
    team_spec_id: TeamSpecId,
    completion_mode: CompletionMode,
}

impl ParallelRoleGroupConfig {
    pub fn new(team_spec_id: TeamSpecId) -> Self {
        Self {
            team_spec_id,
            completion_mode: CompletionMode::AllRequired,
        }
    }

    pub fn team_spec_id(&self) -> &TeamSpecId {
        &self.team_spec_id
    }

    pub fn completion_mode(&self) -> &CompletionMode {
        &self.completion_mode
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompletionMode {
    AllRequired,  // MVP only supports this
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergeConfig {
    strategy: MergeStrategy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MergeStrategy {
    Concatenate,  // Default for MVP
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cargo test -p decacan-runtime workflow_step_can_be_parallel --lib
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workflow/step.rs \
    crates/decacan-runtime/tests/workflow_team_step_test.rs
git commit -m "feat(workflow): add ParallelRoleGroup and Merge step types"
```

---

## Phase 3: Role Assignment and Execution State

### Task 5: RoleAssignment Entity

**Files:**
- Create: `crates/decacan-runtime/src/team/assignment.rs`
- Test: `crates/decacan-runtime/tests/team_assignment_test.rs`

**Description:** Define RoleAssignment representing work assigned to a role within a run.

- [ ] **Step 1: Write the failing test**

```rust
// tests/team_assignment_test.rs
use decacan_runtime::team::assignment::{RoleAssignment, RoleAssignmentId, AssignmentStatus};
use decacan_runtime::team::entity::{RoleId, TeamSpecId};

#[test]
fn role_assignment_can_be_created() {
    let assignment = RoleAssignment::new(
        RoleAssignmentId::new("assign-1"),
        RoleId::new("scout"),
        TeamSpecId::new("research-team"),
    );

    assert_eq!(assignment.id().as_str(), "assign-1");
    assert_eq!(assignment.role_id().as_str(), "scout");
    assert!(matches!(assignment.status(), AssignmentStatus::Pending));
}

#[test]
fn role_assignment_can_complete() {
    let mut assignment = RoleAssignment::new(
        RoleAssignmentId::new("assign-1"),
        RoleId::new("scout"),
        TeamSpecId::new("research-team"),
    );

    assignment.complete("scout output data".to_string());

    assert!(matches!(assignment.status(), AssignmentStatus::Completed { .. }));
    assert_eq!(assignment.output().unwrap(), "scout output data");
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cargo test -p decacan-runtime role_assignment --lib 2>&1 | head -15
```

Expected: FAIL - "cannot find module `assignment`"

- [ ] **Step 3: Implement RoleAssignment entity**

```rust
// src/team/assignment.rs
use serde::{Deserialize, Serialize};
use crate::team::entity::{RoleId, TeamSpecId};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RoleAssignmentId(String);

impl RoleAssignmentId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssignmentStatus {
    Pending,
    Running,
    Completed { output: String },
    Failed { reason: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleAssignment {
    id: RoleAssignmentId,
    role_id: RoleId,
    team_spec_id: TeamSpecId,
    status: AssignmentStatus,
}

impl RoleAssignment {
    pub fn new(id: RoleAssignmentId, role_id: RoleId, team_spec_id: TeamSpecId) -> Self {
        Self {
            id,
            role_id,
            team_spec_id,
            status: AssignmentStatus::Pending,
        }
    }

    pub fn id(&self) -> &RoleAssignmentId {
        &self.id
    }

    pub fn role_id(&self) -> &RoleId {
        &self.role_id
    }

    pub fn status(&self) -> &AssignmentStatus {
        &self.status
    }

    pub fn complete(&mut self, output: String) {
        self.status = AssignmentStatus::Completed { output };
    }

    pub fn fail(&mut self, reason: impl Into<String>) {
        self.status = AssignmentStatus::Failed { reason: reason.into() };
    }

    pub fn output(&self) -> Option<&str> {
        match &self.status {
            AssignmentStatus::Completed { output } => Some(output),
            _ => None,
        }
    }
}
```

- [ ] **Step 4: Export from team/mod.rs**

```rust
// src/team/mod.rs
pub mod entity;
pub mod registry;
pub mod assignment;
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cargo test -p decacan-runtime role_assignment --lib
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-runtime/src/team/assignment.rs \
    crates/decacan-runtime/src/team/mod.rs \
    crates/decacan-runtime/tests/team_assignment_test.rs
git commit -m "feat(team): add RoleAssignment entity with status management"
```

---

### Task 6: ParallelRoleGroupState

**Files:**
- Modify: `crates/decacan-runtime/src/run/entity.rs`
- Test: `crates/decacan-runtime/tests/run_team_state_test.rs`

**Description:** Add team execution state to Run entity for tracking parallel role groups.

- [ ] **Step 1: Write the failing test**

```rust
// tests/run_team_state_test.rs
use decacan_runtime::run::entity::{Run, ParallelRoleGroupState};
use decacan_runtime::team::assignment::{RoleAssignment, RoleAssignmentId};
use decacan_runtime::team::entity::{RoleId, TeamSpecId};

#[test]
fn run_can_track_parallel_role_group() {
    let run = Run::new_for_test("run-1", "task-1");
    
    let mut group_state = ParallelRoleGroupState::new(
        TeamSpecId::new("research-team"),
    );
    
    // Add assignments
    let assignment1 = RoleAssignment::new(
        RoleAssignmentId::new("a1"),
        RoleId::new("scout"),
        TeamSpecId::new("research-team"),
    );
    group_state.add_assignment(assignment1);

    assert_eq!(group_state.assignments().len(), 1);
    assert!(!group_state.all_required_completed());
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cargo test -p decacan-runtime run_can_track_parallel --lib 2>&1 | head -15
```

Expected: FAIL - "cannot find struct `ParallelRoleGroupState`"

- [ ] **Step 3: Add ParallelRoleGroupState to Run entity**

```rust
// src/run/entity.rs - add imports
use crate::team::assignment::RoleAssignment;
use crate::team::entity::TeamSpecId;

// Add to Run struct
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelRoleGroupState {
    team_spec_id: TeamSpecId,
    assignments: Vec<RoleAssignment>,
}

impl ParallelRoleGroupState {
    pub fn new(team_spec_id: TeamSpecId) -> Self {
        Self {
            team_spec_id,
            assignments: Vec::new(),
        }
    }

    pub fn add_assignment(&mut self, assignment: RoleAssignment) {
        self.assignments.push(assignment);
    }

    pub fn assignments(&self) -> &[RoleAssignment] {
        &self.assignments
    }

    pub fn all_required_completed(&self) -> bool {
        !self.assignments.is_empty() && 
        self.assignments.iter().all(|a| matches!(a.status(), 
            crate::team::assignment::AssignmentStatus::Completed { .. }
        ))
    }

    pub fn any_failed(&self) -> bool {
        self.assignments.iter().any(|a| matches!(a.status(),
            crate::team::assignment::AssignmentStatus::Failed { .. }
        ))
    }
}

// Add to Run struct (optional field for now)
// Note: We'll add this field in Task 7
```

- [ ] **Step 4: Export from run module**

```rust
// In run/entity.rs ensure ParallelRoleGroupState is pub
// In run/mod.rs if needed
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cargo test -p decacan-runtime run_can_track_parallel --lib
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-runtime/src/run/entity.rs \
    crates/decacan-runtime/tests/run_team_state_test.rs
git commit -m "feat(run): add ParallelRoleGroupState for tracking team execution"
```

---

## Phase 4: Merge Aggregation

### Task 7: MergeInputBundle

**Files:**
- Create: `crates/decacan-runtime/src/merge/mod.rs`
- Create: `crates/decacan-runtime/src/merge/bundle.rs`
- Test: `crates/decacan-runtime/tests/merge_bundle_test.rs`

**Description:** Implement MergeInputBundle for aggregating role assignment outputs.

- [ ] **Step 1: Write the failing test**

```rust
// tests/merge_bundle_test.rs
use decacan_runtime::merge::bundle::{MergeInputBundle, AssignmentOutput};
use decacan_runtime::team::entity::RoleId;

#[test]
fn merge_bundle_can_aggregate_outputs() {
    let mut bundle = MergeInputBundle::new();
    
    bundle.add_output(AssignmentOutput::new(
        RoleId::new("scout"),
        "Scout found X".to_string(),
    ));
    
    bundle.add_output(AssignmentOutput::new(
        RoleId::new("synthesizer"),
        "Synthesizer conclusion Y".to_string(),
    ));

    assert_eq!(bundle.outputs().len(), 2);
    
    let merged = bundle.concatenate();
    assert!(merged.contains("Scout found X"));
    assert!(merged.contains("Synthesizer conclusion Y"));
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cargo test -p decacan-runtime merge_bundle --lib 2>&1 | head -15
```

Expected: FAIL - "cannot find module `merge`"

- [ ] **Step 3: Implement MergeInputBundle**

```rust
// src/merge/mod.rs
pub mod bundle;

// src/merge/bundle.rs
use serde::{Deserialize, Serialize};
use crate::team::entity::RoleId;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssignmentOutput {
    role_id: RoleId,
    content: String,
}

impl AssignmentOutput {
    pub fn new(role_id: RoleId, content: String) -> Self {
        Self { role_id, content }
    }

    pub fn role_id(&self) -> &RoleId {
        &self.role_id
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MergeInputBundle {
    outputs: Vec<AssignmentOutput>,
}

impl MergeInputBundle {
    pub fn new() -> Self {
        Self {
            outputs: Vec::new(),
        }
    }

    pub fn add_output(&mut self, output: AssignmentOutput) {
        self.outputs.push(output);
    }

    pub fn outputs(&self) -> &[AssignmentOutput] {
        &self.outputs
    }

    pub fn concatenate(&self) -> String {
        self.outputs.iter()
            .map(|o| o.content())
            .collect::<Vec<_>>()
            .join("\n\n")
    }

    pub fn is_empty(&self) -> bool {
        self.outputs.is_empty()
    }
}
```

- [ ] **Step 4: Add merge module to lib.rs**

```rust
// src/lib.rs
pub mod merge;
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cargo test -p decacan-runtime merge_bundle --lib
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-runtime/src/merge/mod.rs \
    crates/decacan-runtime/src/merge/bundle.rs \
    crates/decacan-runtime/tests/merge_bundle_test.rs \
    crates/decacan-runtime/src/lib.rs
git commit -m "feat(merge): add MergeInputBundle for aggregating role outputs"
```

---

## Phase 5: Built-in Team Specs

### Task 8: Builtin TeamSpecs

**Files:**
- Create: `crates/decacan-runtime/src/team/builtin.rs`
- Test: `crates/decacan-runtime/tests/team_builtin_test.rs`

**Description:** Implement built-in team specs (research-team, review-team).

- [ ] **Step 1: Write the failing test**

```rust
// tests/team_builtin_test.rs
use decacan_runtime::team::builtin::BuiltinTeamSpecRegistry;
use decacan_runtime::team::registry::TeamSpecRegistry;
use decacan_runtime::team::entity::TeamSpecId;

#[test]
fn builtin_registry_has_research_team() {
    let registry = BuiltinTeamSpecRegistry::new();
    
    let team = registry.resolve(&TeamSpecId::new("research-team"))
        .expect("should have research-team");
    
    assert_eq!(team.id().as_str(), "research-team");
    assert_eq!(team.roles().len(), 3); // scout, synthesizer, verifier
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cargo test -p decacan-runtime builtin_registry_has_research --lib 2>&1 | head -15
```

Expected: FAIL - "cannot find module `builtin`"

- [ ] **Step 3: Implement BuiltinTeamSpecRegistry**

```rust
// src/team/builtin.rs
use crate::team::entity::{Role, RoleId, TeamSpec, TeamSpecId};
use crate::team::registry::TeamSpecRegistry;
use std::collections::HashMap;

pub struct BuiltinTeamSpecRegistry {
    specs: HashMap<String, TeamSpec>,
}

impl BuiltinTeamSpecRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            specs: HashMap::new(),
        };
        registry.init_builtin_specs();
        registry
    }

    fn init_builtin_specs(&mut self) {
        // Research Team
        let scout = Role::new(
            RoleId::new("scout"),
            "Scout",
            "Gathers initial information and context from sources",
        )
        .with_allowed_routines(vec!["scan_markdown".to_string(), "read_contents".to_string()]);

        let synthesizer = Role::new(
            RoleId::new("synthesizer"),
            "Synthesizer",
            "Combines information into coherent summaries",
        )
        .with_allowed_routines(vec!["draft_summary".to_string()])
        .with_synthesis_profile("consolidation");

        let verifier = Role::new(
            RoleId::new("verifier"),
            "Verifier",
            "Checks accuracy and completeness of outputs",
        )
        .with_allowed_routines(vec!["validate_output".to_string()]);

        let research_team = TeamSpec::new(
            TeamSpecId::new("research-team"),
            "Research Team",
            "A three-role team for research and synthesis tasks",
        )
        .with_version("1.0.0")
        .with_provider("builtin")
        .add_role(scout)
        .add_role(synthesizer)
        .add_role(verifier)
        .with_lead_role(RoleId::new("synthesizer"));

        self.specs.insert(
            research_team.id().as_str().to_string(),
            research_team,
        );
    }
}

impl TeamSpecRegistry for BuiltinTeamSpecRegistry {
    fn resolve(&self, id: &TeamSpecId) -> Option<TeamSpec> {
        self.specs.get(id.as_str()).cloned()
    }

    fn list_available(&self) -> Vec<&TeamSpecId> {
        self.specs.values().map(|s| s.id()).collect()
    }
}
```

- [ ] **Step 4: Export from team/mod.rs**

```rust
// src/team/mod.rs
pub mod entity;
pub mod registry;
pub mod assignment;
pub mod builtin;
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cargo test -p decacan-runtime builtin_registry_has_research --lib
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-runtime/src/team/builtin.rs \
    crates/decacan-runtime/src/team/mod.rs \
    crates/decacan-runtime/tests/team_builtin_test.rs
git commit -m "feat(team): add builtin research-team spec with scout/synthesizer/verifier"
```

---

## Phase 6: Integration and Testing

### Task 9: Team Execution Integration Test

**Files:**
- Create: `crates/decacan-runtime/tests/team_execution_integration_test.rs`

**Description:** Integration test demonstrating full team execution flow.

- [ ] **Step 1: Write comprehensive integration test**

```rust
// tests/team_execution_integration_test.rs
use decacan_runtime::team::builtin::BuiltinTeamSpecRegistry;
use decacan_runtime::team::registry::TeamSpecRegistry;
use decacan_runtime::team::entity::TeamSpecId;
use decacan_runtime::team::assignment::{RoleAssignment, RoleAssignmentId};
use decacan_runtime::run::entity::ParallelRoleGroupState;
use decacan_runtime::merge::bundle::MergeInputBundle;

#[test]
fn team_execution_full_flow() {
    // 1. Setup: Get team spec from registry
    let registry = BuiltinTeamSpecRegistry::new();
    let team = registry.resolve(&TeamSpecId::new("research-team"))
        .expect("research-team should exist");
    
    // 2. Create parallel role group state
    let mut group_state = ParallelRoleGroupState::new(team.id().clone());
    
    // 3. Create assignments for each role
    for role in team.roles() {
        let assignment = RoleAssignment::new(
            RoleAssignmentId::new(format!("assign-{}-001", role.id().as_str())),
            role.id().clone(),
            team.id().clone(),
        );
        group_state.add_assignment(assignment);
    }
    
    assert_eq!(group_state.assignments().len(), 3);
    assert!(!group_state.all_required_completed());
    
    // 4. Simulate completing assignments
    let assignments: Vec<_> = group_state.assignments()
        .iter()
        .map(|a| (a.id().clone(), a.role_id().clone()))
        .collect();
    
    for (assign_id, role_id) in assignments {
        // In real execution, we'd look up the assignment and complete it
        // For this test, we just verify the structure exists
        println!("Role {} assigned with {}", role_id.as_str(), assign_id.as_str());
    }
    
    // 5. Create merge bundle
    let mut bundle = MergeInputBundle::new();
    bundle.add_output(decacan_runtime::merge::bundle::AssignmentOutput::new(
        decacan_runtime::team::entity::RoleId::new("scout"),
        "Scout findings...".to_string(),
    ));
    bundle.add_output(decacan_runtime::merge::bundle::AssignmentOutput::new(
        decacan_runtime::team::entity::RoleId::new("synthesizer"),
        "Synthesized summary...".to_string(),
    ));
    
    let merged = bundle.concatenate();
    assert!(!merged.is_empty());
    
    println!("Merged output:\n{}", merged);
}
```

- [ ] **Step 2: Run test to verify it compiles and passes**

```bash
cargo test -p decacan-runtime team_execution_full_flow --test team_execution_integration 2>&1 | tail -20
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-runtime/tests/team_execution_integration_test.rs
git commit -m "test(team): add integration test for full team execution flow"
```

---

### Task 10: Documentation Update

**Files:**
- Create: `docs/superpowers/plans/2026-03-31-minimal-team-execution-implementation-summary.md`

**Description:** Document the implementation and add usage examples.

- [ ] **Step 1: Create implementation summary document**

```markdown
# Minimal Team Execution Implementation Summary

Date: 2026-03-31

## What Was Implemented

### Core Components

1. **TeamSpec Registry** (`team/registry.rs`, `team/builtin.rs`)
   - `TeamSpecRegistry` trait for resolving team specs
   - `InMemoryTeamSpecRegistry` for testing
   - `BuiltinTeamSpecRegistry` with built-in `research-team`

2. **Entity Definitions** (`team/entity.rs`)
   - `Role` - Individual role with responsibilities and allowed routines
   - `TeamSpec` - Team composition with roles and lead role
   - `RoleId`, `TeamSpecId` - Strongly typed identifiers

3. **Role Assignment** (`team/assignment.rs`)
   - `RoleAssignment` - Work unit assigned to a role
   - `AssignmentStatus` - Pending, Running, Completed, Failed
   - `RoleAssignmentId` - Unique identifier

4. **Workflow Extension** (`workflow/step.rs`)
   - `WorkflowStepType::ParallelRoleGroup` - Parallel execution step
   - `WorkflowStepType::Merge` - Aggregation step
   - `ParallelRoleGroupConfig` - Team configuration
   - `CompletionMode::AllRequired` - MVP completion strategy

5. **Execution State** (`run/entity.rs`)
   - `ParallelRoleGroupState` - Tracks parallel group execution
   - Assignment tracking and completion detection

6. **Merge Aggregation** (`merge/bundle.rs`)
   - `MergeInputBundle` - Collects role outputs
   - `AssignmentOutput` - Individual role output
   - `concatenate()` strategy for MVP

## Usage Example

```rust
use decacan_runtime::team::builtin::BuiltinTeamSpecRegistry;
use decacan_runtime::team::registry::TeamSpecRegistry;
use decacan_runtime::team::entity::TeamSpecId;
use decacan_runtime::run::entity::ParallelRoleGroupState;
use decacan_runtime::merge::bundle::MergeInputBundle;

// 1. Get team spec from registry
let registry = BuiltinTeamSpecRegistry::new();
let team = registry.resolve(&TeamSpecId::new("research-team")).unwrap();

// 2. Create parallel role group
let mut group = ParallelRoleGroupState::new(team.id().clone());

// 3. Assign work to each role
for role in team.roles() {
    let assignment = RoleAssignment::new(
        RoleAssignmentId::new(format!("assign-{}", role.id().as_str())),
        role.id().clone(),
        team.id().clone(),
    );
    group.add_assignment(assignment);
}

// 4. Execute assignments (each role works independently)
// ... execution logic ...

// 5. When all required completed, merge outputs
let mut bundle = MergeInputBundle::new();
for assignment in group.assignments() {
    if let Some(output) = assignment.output() {
        bundle.add_output(AssignmentOutput::new(
            assignment.role_id().clone(),
            output.to_string(),
        ));
    }
}

let merged_output = bundle.concatenate();
```

## Architecture Decisions

### Why These Design Choices?

1. **Runtime-mediated collaboration** - No direct agent communication
   - Deterministic execution
   - Full audit trail
   - Policy enforcement at single point

2. **ParallelRoleGroup as Workflow step** - Not a separate runtime
   - Fits existing execution model
   - Reuses pause/resume infrastructure
   - Consistent state management

3. **Intermediate results only** - Roles don't produce Artifacts
   - Merge step is single point of truth
   - Cleaner dependency tracking
   - Easier rollback

4. **Builtin only in MVP** - No extension-provided teams yet
   - Simpler initial implementation
   - Clear migration path later
   - Focus on core semantics

## Next Steps

### Phase 7: Runtime Integration (Future Work)

- [ ] Integrate ParallelRoleGroup execution into Run service
- [ ] Handle Approval within team context (with role_id metadata)
- [ ] Team execution trace recording
- [ ] Error handling for partial failures

### Phase 8: Advanced Features (Future Work)

- [ ] Extension-provided TeamSpecs
- [ ] Additional merge strategies (not just concatenate)
- [ ] Dynamic role assignment
- [ ] Nested parallel groups

## Testing

All components have unit tests:
- `tests/team_entity_test.rs` - Entity creation and validation
- `tests/team_registry_test.rs` - Registry resolution
- `tests/team_assignment_test.rs` - Assignment lifecycle
- `tests/workflow_team_step_test.rs` - Workflow integration
- `tests/run_team_state_test.rs` - Execution state tracking
- `tests/merge_bundle_test.rs` - Merge aggregation
- `tests/team_builtin_test.rs` - Built-in specs
- `tests/team_execution_integration_test.rs` - Full flow

Run all tests:
```bash
cargo test -p decacan-runtime team
```
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-03-31-minimal-team-execution-implementation-summary.md
git commit -m "docs(team): add implementation summary and usage guide"
```

---

## Final Verification

### Task 11: Run All Tests

- [ ] **Step 1: Run complete test suite**

```bash
cd /Users/nicholasl/Documents/build-whatever/decacan
cargo test -p decacan-runtime --lib 2>&1 | tail -30
```

Expected: All tests PASS

- [ ] **Step 2: Verify compilation**

```bash
cargo check -p decacan-runtime 2>&1 | grep -E "(error|warning)" | head -20
```

Expected: No errors, only warnings acceptable

- [ ] **Step 3: Final commit**

```bash
git log --oneline -10
```

Verify all commits are present and clean.

---

## Summary

This implementation plan covers **Phase 1-6** of Minimal Team Execution:

- ✅ Phase 1: TeamSpec Registry Foundation (Tasks 1-3)
- ✅ Phase 2: Workflow Extension (Task 4)
- ✅ Phase 3: Role Assignment & Execution State (Tasks 5-6)
- ✅ Phase 4: Merge Aggregation (Task 7)
- ✅ Phase 5: Built-in Team Specs (Task 8)
- ✅ Phase 6: Integration & Testing (Tasks 9-11)

**Total Tasks: 11**
**Estimated Time: 2-3 hours** for skilled Rust developer

**Architecture Compliance:**
- ✅ Runtime-mediated collaboration (no direct agent communication)
- ✅ Team as Workflow extension (not new runtime)
- ✅ Intermediate results only (merge produces Artifacts)
- ✅ Builtin only in MVP (no extension complexity)

**For execution, choose:**
1. **Subagent-Driven** - Recommended for parallel task execution
2. **Inline Execution** - For sequential, focused development
