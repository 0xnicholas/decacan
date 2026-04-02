# Decacan Playbook/Workflow 架构重构实施计划

Date: 2026-03-30
Status: Approved for Implementation
Related Spec: 2026-03-30-decacan-knowledge-learning-design.md

---

## 执行摘要

**目标：** 将 Playbook/Workflow 架构从硬编码改为声明式，使 Workflow 成为 Playbook 的一部分

**时间线：** 4 周（Week 1-4: 基础重构 → 契约系统 → 高级特性 → 迁移测试）

**范围：** 重构 `decacan-runtime` 的 playbook、workflow、routine 模块

---

## 1. 架构设计（已确认）

### 1.1 两阶段架构

**Phase 1（当前 4 周）：Routine 直接实现（简化版）**
- Workflow 步骤直接引用 Routine
- 保持简单，快速实现
- 支持知识学习系统集成

**Phase 2（未来扩展）：Capability 抽象层**
- 引入 Capability → Implementation 架构
- 支持 Routine/Tool/Skill 多种实现
- Agent 可介入决策

### 1.2 核心变更（Phase 1）

**设计理念：先简化实现，后抽象扩展**

Phase 1 保持简单：Routine 直接实现，不引入 Capability 抽象层。这样可以：
- 快速完成重构，替换硬编码逻辑
- 支持知识学习系统（通过 `step.knowledge_context`）
- 为 Phase 2 预留清晰的扩展点

```
当前（硬编码）：                    Phase 1（简化版）：
┌──────────────────┐              ┌──────────────────────┐
│ PlaybookVersion  │              │ PlaybookVersion      │
│ ├─ spec_document │ ← 未解析    │ ├─ spec: PlaybookSpec│ ← 已解析
│ │   (String)     │              │ │   ├─ metadata      │
│ └─ ...           │              │ │   ├─ input_schema  │
└──────────────────┘              │ │   ├─ workflow      │ ← 内嵌
                                  │ │   │  └─ steps      │
                                  │ │   │     └─ routine │ ← 直接引用
                                  │ │   └─ contracts     │
                                  │ └─ compiled_workflow │
                                  └──────────────────────┘

Phase 2（未来扩展）：
┌──────────────────────────┐
│ StepDefinition           │
│ ├─ capability:           │ ← Capability 抽象层
│ │   CapabilityRef        │
│ └─ ...                   │
└───────────┬──────────────┘
            │ resolve
            ▼
  ┌──────────────────────┐
  │ Implementation       │
  │ ├─ Routine           │
  │ ├─ Tool              │
  │ └─ Skill             │
  └──────────────────────┘
```

### 1.2 实体关系

```rust
// PlaybookSpec - YAML 解析后的结构化数据
pub struct PlaybookSpec {
    pub metadata: PlaybookMetadata,
    pub input_schema: InputSchema,
    pub workflow: WorkflowDefinition,           // ← Workflow 是这里的一部分
    pub capability_refs: CapabilityRefs,
    pub output_contract: OutputContract,
    pub policy_profile: PolicyProfile,
}

// WorkflowDefinition - 不再独立存在
pub struct WorkflowDefinition {
    pub steps: Vec<StepDefinition>,
    pub default_retry_policy: RetryPolicy,
    pub error_handling: ErrorHandlingStrategy,
}

// StepDefinition - 引用 Routine（动态）
pub struct StepDefinition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub routine: RoutineRef,                    // ← 不再是硬编码枚举
    pub input_mapping: InputMapping,
    pub output_mapping: OutputMapping,
    pub transition: Transition,
}
```

### 1.3 YAML Spec 格式（已确认）

```yaml
# 示例：总结资料 Playbook Spec
metadata:
  title: "总结资料"
  description: "扫描 markdown 文件并生成摘要"
  mode: standard
  version: "1.0.0"
  tags: ["文档处理", "摘要生成"]

input_schema:
  - name: source_directory
    type: path
    required: true
    description: "包含 markdown 文件的目录"
  - name: output_format
    type: enum
    options: [markdown, json]
    default: markdown

workflow:
  steps:
    - id: scan
      name: 扫描文件
      description: "扫描工作区中的 markdown 文件"
      routine:
        class: builtin
        name: scan_markdown_files
        version: "1.0.0"
      input_mapping:
        directory: "{{ input.source_directory }}"
      transition:
        next: read
    
    - id: read
      name: 读取内容
      routine:
        class: builtin
        name: read_file_content
      transition:
        next: analyze
    
    - id: analyze
      name: 分析主题
      routine:
        class: builtin
        name: extract_topics
      transition:
        conditional:
          - condition: "output.topics.length > 0"
            then: generate
          - condition: "output.topics.length == 0"
            then: skip_empty
    
    - id: generate
      name: 生成摘要
      routine:
        class: builtin
        name: generate_summary
      transition:
        next: write
    
    - id: write
      name: 写入输出
      routine:
        class: builtin
        name: write_output
      transition:
        next: register
    
    - id: register
      name: 注册产物
      routine:
        class: builtin
        name: register_artifact
      transition:
        end

capability_refs:
  routines:
    - builtin.scan_markdown_files
    - builtin.read_file_content
    - builtin.extract_topics
    - builtin.generate_summary
    - builtin.write_output
    - builtin.register_artifact
  tools:
    - builtin.workspace.read
    - builtin.workspace.write

output_contract:
  primary_artifact:
    type: markdown_document
    path: "output/summary.md"
    schema: summary_schema_v1
  backup_policy: versioned
```

---

## 2. 实施计划（4 周）

### Week 1: 基础重构

**目标：** 建立新的 Spec 类型系统和 Routine Trait

#### Task 1.1: 创建 Playbook Spec 模块

**Files:**
- Create: `crates/decacan-runtime/src/playbook/spec/mod.rs`
- Create: `crates/decacan-runtime/src/playbook/spec/entities.rs`
- Create: `crates/decacan-runtime/src/playbook/spec/parser.rs`
- Modify: `crates/decacan-runtime/src/playbook/mod.rs`

**Steps:**

1. **定义 PlaybookSpec 实体**

```rust
// crates/decacan-runtime/src/playbook/spec/entities.rs
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Playbook 完整规范
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookSpec {
    pub metadata: PlaybookMetadata,
    pub input_schema: InputSchema,
    pub workflow: WorkflowDefinition,
    pub capability_refs: CapabilityRefs,
    pub output_contract: OutputContract,
    pub policy_profile: PolicyProfile,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookMetadata {
    pub title: String,
    pub description: String,
    pub mode: PlaybookMode,
    pub version: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkflowDefinition {
    pub steps: Vec<StepDefinition>,
    pub default_retry_policy: RetryPolicy,
    pub error_handling: ErrorHandlingStrategy,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StepDefinition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub routine: RoutineRef,
    pub input_mapping: InputMapping,
    pub output_mapping: OutputMapping,
    pub retry_policy: Option<RetryPolicy>,
    pub timeout_seconds: Option<u32>,
    pub transition: Transition,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RoutineRef {
    pub capability_class: String,  // "builtin", "extension"
    pub routine_name: String,
    pub version: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Transition {
    Next { step_id: String },
    Conditional { branches: Vec<ConditionalBranch> },
    End,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConditionalBranch {
    pub condition: String,
    pub step_id: String,
}

pub type InputSchema = Vec<InputField>;
pub type InputMapping = HashMap<String, String>;
pub type OutputMapping = HashMap<String, String>;
```

2. **实现 YAML 解析器**

```rust
// crates/decacan-runtime/src/playbook/spec/parser.rs
use serde_yaml;

use super::entities::PlaybookSpec;

pub struct PlaybookSpecParser;

impl PlaybookSpecParser {
    pub fn parse(yaml_content: &str) -> Result<PlaybookSpec, SpecParseError> {
        let spec: PlaybookSpec = serde_yaml::from_str(yaml_content)
            .map_err(|e| SpecParseError::InvalidYaml(e.to_string()))?;
        
        // 验证
        Self::validate(&spec)?;
        
        Ok(spec)
    }
    
    fn validate(spec: &PlaybookSpec) -> Result<(), SpecParseError> {
        // 验证步骤 ID 唯一
        let step_ids: Vec<_> = spec.workflow.steps.iter().map(|s| &s.id).collect();
        let unique_ids: std::collections::HashSet<_> = step_ids.iter().cloned().collect();
        if step_ids.len() != unique_ids.len() {
            return Err(SpecParseError::DuplicateStepIds);
        }
        
        // 验证 transition 引用的步骤存在
        for step in &spec.workflow.steps {
            Self::validate_transition(&step.transition, &unique_ids, &step.id)?;
        }
        
        // 验证有且仅有一个 "end" 或循环
        // ...
        
        Ok(())
    }
    
    fn validate_transition(
        transition: &Transition,
        valid_ids: &std::collections::HashSet<&String>,
        current_id: &str
    ) -> Result<(), SpecParseError> {
        match transition {
            Transition::Next { step_id } => {
                if !valid_ids.contains(step_id) {
                    return Err(SpecParseError::InvalidTransition {
                        from: current_id.to_string(),
                        to: step_id.clone(),
                    });
                }
            }
            Transition::Conditional { branches } => {
                for branch in branches {
                    if !valid_ids.contains(&branch.step_id) {
                        return Err(SpecParseError::InvalidTransition {
                            from: current_id.to_string(),
                            to: branch.step_id.clone(),
                        });
                    }
                }
            }
            Transition::End => {}
        }
        Ok(())
    }
}

#[derive(Debug, thiserror::Error)]
pub enum SpecParseError {
    #[error("invalid YAML: {0}")]
    InvalidYaml(String),
    #[error("duplicate step IDs")]
    DuplicateStepIds,
    #[error("invalid transition from '{from}' to '{to}'")]
    InvalidTransition { from: String, to: String },
    #[error("no start step found")]
    NoStartStep,
    #[error("unreachable steps: {0:?}")]
    UnreachableSteps(Vec<String>),
}
```

3. **导出模块**

```rust
// crates/decacan-runtime/src/playbook/spec/mod.rs
pub mod entities;
pub mod parser;

pub use entities::*;
pub use parser::{PlaybookSpecParser, SpecParseError};
```

4. **测试**

```rust
// crates/decacan-runtime/tests/playbook_spec.rs
#[test]
fn test_parse_summary_spec() {
    let yaml = include_str!("../fixtures/summary_playbook.yaml");
    let spec = PlaybookSpecParser::parse(yaml).unwrap();
    
    assert_eq!(spec.metadata.title, "总结资料");
    assert_eq!(spec.workflow.steps.len(), 7);
}

#[test]
fn test_invalid_transition() {
    let yaml = r#"
metadata:
  title: "Test"
workflow:
  steps:
    - id: step1
      name: "Step 1"
      routine:
        class: builtin
        name: test
      transition:
        next: non_existent
"#;
    
    let result = PlaybookSpecParser::parse(yaml);
    assert!(matches!(result, Err(SpecParseError::InvalidTransition { .. })));
}
```

**Commit:**
```bash
git add crates/decacan-runtime/src/playbook/spec/
git add crates/decacan-runtime/tests/playbook_spec.rs
git add crates/decacan-runtime/fixtures/
git commit -m "feat(playbook): add PlaybookSpec types and YAML parser

- Define PlaybookSpec, WorkflowDefinition, StepDefinition
- Implement YAML parser with validation
- Add comprehensive tests"
```

#### Task 1.2: 重构 Routine 系统（Trait-based）

**Files:**
- Create: `crates/decacan-runtime/src/routine/trait.rs`
- Create: `crates/decacan-runtime/src/routine/registry.rs`（替换原有）
- Create: `crates/decacan-runtime/src/routine/builtin/`（迁移现有 routines）
- Modify: `crates/decacan-runtime/src/routine/mod.rs`

**Steps:**

1. **定义 Routine Trait**

```rust
// crates/decacan-runtime/src/routine/trait.rs
use async_trait::async_trait;
use serde_json::Value;

use crate::contract::{Contract, ValidationError};

/// Routine 能力 trait
#[async_trait]
pub trait Routine: Send + Sync {
    /// 返回 Routine 类型标识
    fn routine_type(&self) -> RoutineType;
    
    /// 输入契约
    fn input_contract(&self) -> &Contract;
    
    /// 输出契约
    fn output_contract(&self) -> &Contract;
    
    /// 验证输入
    fn validate_input(&self, input: &Value) -> Result<(), Vec<ValidationError>> {
        self.input_contract().validate(input)
    }
    
    /// 执行 Routine
    async fn execute(
        &self,
        ctx: &mut RoutineContext,
        input: Value,
    ) -> Result<Value, RoutineError>;
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct RoutineType {
    pub capability_class: String,
    pub routine_name: String,
    pub version: String,
}

impl RoutineType {
    pub fn new(class: &str, name: &str, version: &str) -> Self {
        Self {
            capability_class: class.to_string(),
            routine_name: name.to_string(),
            version: version.to_string(),
        }
    }
}

/// Routine 执行上下文
pub struct RoutineContext {
    pub workspace_root: PathBuf,
    pub step_id: String,
    pub run_id: String,
    // ... 其他上下文
}

#[derive(Debug, thiserror::Error)]
pub enum RoutineError {
    #[error("input validation failed: {0:?}")]
    InputValidation(Vec<ValidationError>),
    #[error("execution failed: {0}")]
    Execution(String),
    #[error("output validation failed: {0:?}")]
    OutputValidation(Vec<ValidationError>),
    #[error("timeout after {0}s")]
    Timeout(u32),
}
```

2. **实现动态注册表**

```rust
// crates/decacan-runtime/src/routine/registry.rs
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use super::trait::{Routine, RoutineType};

pub struct RoutineRegistry {
    routines: RwLock<HashMap<RoutineType, Arc<dyn Routine>>>,
}

impl RoutineRegistry {
    pub fn new() -> Self {
        Self {
            routines: RwLock::new(HashMap::new()),
        }
    }
    
    pub fn register(&self, routine: Arc<dyn Routine>) {
        let routine_type = routine.routine_type();
        let mut routines = self.routines.write().unwrap();
        routines.insert(routine_type, routine);
    }
    
    pub fn get(&self, routine_type: &RoutineType) -> Option<Arc<dyn Routine>> {
        let routines = self.routines.read().unwrap();
        routines.get(routine_type).cloned()
    }
    
    pub fn list_available(&self) -> Vec<RoutineType> {
        let routines = self.routines.read().unwrap();
        routines.keys().cloned().collect()
    }
}

impl Default for RoutineRegistry {
    fn default() -> Self {
        let registry = Self::new();
        
        // 注册内置 routines
        registry.register(Arc::new(ScanMarkdownFilesRoutine));
        registry.register(Arc::new(ReadFileContentRoutine));
        // ... 其他内置 routines
        
        registry
    }
}
```

3. **迁移现有 Routine（示例）**

```rust
// crates/decacan-runtime/src/routine/builtin/scan_markdown.rs
use async_trait::async_trait;

pub struct ScanMarkdownFilesRoutine;

#[async_trait]
impl Routine for ScanMarkdownFilesRoutine {
    fn routine_type(&self) -> RoutineType {
        RoutineType::new("builtin", "scan_markdown_files", "1.0.0")
    }
    
    fn input_contract(&self) -> &Contract {
        static CONTRACT: Lazy<Contract> = Lazy::new(|| {
            Contract::object()
                .field("directory", Contract::path().required())
                .field("recursive", Contract::boolean().default(false))
        });
        &CONTRACT
    }
    
    fn output_contract(&self) -> &Contract {
        static CONTRACT: Lazy<Contract> = Lazy::new(|| {
            Contract::object()
                .field("files", Contract::array(Contract::path()))
                .field("count", Contract::integer())
        });
        &CONTRACT
    }
    
    async fn execute(
        &self,
        ctx: &mut RoutineContext,
        input: Value,
    ) -> Result<Value, RoutineError> {
        let directory = input["directory"].as_str()
            .ok_or_else(|| RoutineError::Execution("missing directory".to_string()))?;
        
        // 实际执行逻辑（从原 executor 迁移）
        let files = ctx.filesystem.list_markdown_files(directory).await
            .map_err(|e| RoutineError::Execution(e.to_string()))?;
        
        Ok(json!({
            "files": files,
            "count": files.len()
        }))
    }
}
```

**Commit:**
```bash
git add crates/decacan-runtime/src/routine/trait.rs
git add crates/decacan-runtime/src/routine/registry.rs
git add crates/decacan-runtime/src/routine/builtin/
git commit -m "feat(routine): refactor to trait-based system

- Define Routine trait with contracts
- Implement dynamic RoutineRegistry
- Migrate builtin routines to trait implementations
- Support dynamic routine resolution"
```

#### Task 1.3: 重构 Workflow 编译器

**Files:**
- Delete: `crates/decacan-runtime/src/workflow/compiler.rs`（替换）
- Create: `crates/decacan-runtime/src/workflow/compiler.rs`（新）
- Create: `crates/decacan-runtime/src/workflow/validator.rs`

**Steps:**

1. **新编译器实现**

```rust
// crates/decacan-runtime/src/workflow/compiler.rs
use crate::playbook::spec::entities::PlaybookSpec;
use crate::routine::registry::RoutineRegistry;

pub struct WorkflowCompiler;

impl WorkflowCompiler {
    /// 从 PlaybookSpec 编译 Workflow
    pub fn compile(
        spec: &PlaybookSpec,
        registry: &RoutineRegistry,
    ) -> Result<Workflow, CompileError> {
        // 验证所有引用的 routine 存在
        Self::validate_routines(&spec.workflow, registry)?;
        
        // 验证契约兼容性
        Self::validate_contracts(&spec.workflow, registry)?;
        
        // 编译步骤
        let steps = spec.workflow.steps.iter()
            .map(|step| self.compile_step(step))
            .collect::<Result<Vec<_>, _>>()?;
        
        Ok(Workflow {
            id: format!("workflow-{}-{}", spec.metadata.title, uuid::Uuid::new_v4()),
            steps,
            compiled_at: OffsetDateTime::now_utc(),
        })
    }
    
    fn validate_routines(
        workflow: &WorkflowDefinition,
        registry: &RoutineRegistry,
    ) -> Result<(), CompileError> {
        for step in &workflow.steps {
            let routine_type = RoutineType {
                capability_class: step.routine.capability_class.clone(),
                routine_name: step.routine.routine_name.clone(),
                version: step.routine.version.clone(),
            };
            
            if registry.get(&routine_type).is_none() {
                return Err(CompileError::UnknownRoutine {
                    step_id: step.id.clone(),
                    routine: routine_type,
                });
            }
        }
        Ok(())
    }
    
    fn compile_step(&self, step: &StepDefinition) -> Result<WorkflowStep, CompileError> {
        Ok(WorkflowStep {
            id: step.id.clone(),
            name: step.name.clone(),
            description: step.description.clone(),
            routine_type: RoutineType {
                capability_class: step.routine.capability_class.clone(),
                routine_name: step.routine.routine_name.clone(),
                version: step.routine.version.clone(),
            },
            transition: self.compile_transition(&step.transition)?,
            // ...
        })
    }
}

#[derive(Debug, thiserror::Error)]
pub enum CompileError {
    #[error("unknown routine in step '{step_id}': {routine:?}")]
    UnknownRoutine { step_id: String, routine: RoutineType },
    #[error("contract mismatch: {0}")]
    ContractMismatch(String),
    #[error("invalid workflow: {0}")]
    InvalidWorkflow(String),
}
```

2. **更新 Workflow 实体**

```rust
// crates/decacan-runtime/src/workflow/entity.rs（修改）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub steps: Vec<WorkflowStep>,
    pub compiled_at: OffsetDateTime,
    // 移除 playbook_id，Workflow 不再引用外部 Playbook
    // 它现在是编译后的执行计划，可以独立存在
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub name: String,
    pub description: String,
    pub routine_type: RoutineType,  // 引用注册表中的 routine
    pub transition: CompiledTransition,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompiledTransition {
    Next(String),           // 直接下一步
    Conditional(Vec<CompiledBranch>), // 条件分支
    End,
}
```

**Commit:**
```bash
git commit -m "feat(workflow): refactor compiler to use PlaybookSpec

- WorkflowCompiler compiles from PlaybookSpec
- Validates routines and contracts
- Removes hardcoded workflow definitions"
```

#### Task 1.4: 重构执行引擎

**Files:**
- Modify: `crates/decacan-runtime/src/routine/executor.rs`（重写）
- Create: `crates/decacan-runtime/src/workflow/engine.rs`

**Steps：**

```rust
// crates/decacan-runtime/src/workflow/engine.rs
pub struct WorkflowEngine {
    routine_registry: Arc<RoutineRegistry>,
}

impl WorkflowEngine {
    pub async fn execute(
        &self,
        workflow: &Workflow,
        initial_context: ExecutionContext,
    ) -> Result<ExecutionResult, ExecutionError> {
        let mut context = initial_context;
        let mut current_step_id = self.find_start_step(workflow)?;
        
        while let Some(step_id) = current_step_id {
            let step = workflow.get_step(&step_id)
                .ok_or(ExecutionError::StepNotFound(step_id.clone()))?;
            
            // 执行步骤
            let result = self.execute_step(step, &mut context).await?;
            
            // 决定下一步
            current_step_id = self.determine_next_step(step, &result, &context)?;
        }
        
        Ok(ExecutionResult {
            context,
            completed: true,
        })
    }
    
    async fn execute_step(
        &self,
        step: &WorkflowStep,
        ctx: &mut ExecutionContext,
    ) -> Result<StepResult, ExecutionError> {
        // 获取 routine
        let routine = self.routine_registry.get(&step.routine_type)
            .ok_or(ExecutionError::RoutineNotFound(step.routine_type.clone()))?;
        
        // 准备输入
        let input = self.prepare_input(step, ctx)?;
        
        // 验证输入
        routine.validate_input(&input)
            .map_err(ExecutionError::InputValidation)?;
        
        // 执行
        let output = routine.execute(&mut ctx.routine_ctx, input).await
            .map_err(ExecutionError::RoutineError)?;
        
        // 验证输出
        routine.output_contract().validate(&output)
            .map_err(ExecutionError::OutputValidation)?;
        
        // 存储输出到上下文
        ctx.set_step_output(&step.id, output.clone());
        
        Ok(StepResult { output })
    }
}
```

**Commit:**
```bash
git commit -m "feat(executor): implement new WorkflowEngine

- Trait-based routine execution
- Contract validation at runtime
- Support conditional transitions"
```

### Week 2: 契约系统

**目标：** 实现输入/输出契约验证

（详细实现类似，包含 Contract trait、JSON Schema 验证等）

### Week 3: 高级特性

**目标：** 条件分支、重试、错误处理

（详细实现包含 ConditionalTransition、RetryPolicy、Fallback 等）

### Week 4: 迁移与测试

**目标：** 创建 YAML specs、全面测试、迁移现有 playbook

（详细实现包含测试用例、迁移脚本、文档等）

---

## Phase 2: Capability 抽象层（未来扩展）

### 目标

将 Routine 实现升级为 **Capability → Implementation** 架构，支持多种实现类型（Routine/Tool/Skill）和 Agent 决策。

### 架构演进

```
Phase 1 (当前重构):          Phase 2 (未来扩展):
┌─────────────────┐         ┌──────────────────────────┐
│ StepDefinition  │         │ StepDefinition           │
│ ├─ routine:     │   →     │ ├─ capability:           │ ← 引用 Capability
│ │   RoutineRef  │         │ │   CapabilityRef        │
│ └─ ...          │         │ └─ ...                   │
└─────────────────┘         └───────────┬──────────────┘
                                        │ resolve
                                        ▼
                              ┌──────────────────────┐
                              │ CapabilityResolver   │
                              │ (Agent 可介入)        │
                              └───────────┬──────────┘
                                          │ select
                                          ▼
                              ┌──────────────────────┐
                              │ Implementation       │
                              │ ├─ Routine           │
                              │ ├─ Tool  (新增)      │
                              │ └─ Skill (新增)      │
                              └──────────────────────┘
```

### 新增组件

**1. Capability 定义**

```rust
// capability/mod.rs (Phase 2 新增)
pub struct Capability {
    pub id: String,
    pub name: String,
    pub description: String,
    pub input_contract: Contract,
    pub output_contract: Contract,
    pub implementations: Vec<ImplementationRef>,
}

pub struct ImplementationRef {
    pub implementation_type: ImplementationType,  // Routine | Tool | Skill
    pub ref_name: String,
    pub version: String,
    pub constraints: Vec<Constraint>,  // 适用条件
}

pub enum ImplementationType {
    Routine,
    Tool,    // Phase 2 新增：外部 API 调用
    Skill,   // Phase 2 新增：子 workflow 组合
}
```

**2. Capability Resolver**

```rust
// capability/resolver.rs (Phase 2 新增)
pub trait CapabilityResolver: Send + Sync {
    /// 根据上下文选择最佳实现
    fn resolve(
        &self,
        capability_id: &str,
        context: &ExecutionContext,
    ) -> Result<ImplementationRef, ResolveError>;
}

// 简单实现：按优先级选择
pub struct PriorityResolver;

// Agent 实现：AI 决策
pub struct AgentResolver {
    agent: Arc<dyn Agent>,
}
```

**3. Playbook 使用方式变化**

```yaml
# Phase 1: 直接引用 Routine
workflow:
  steps:
    - id: analyze
      routine:  # ← 直接指定实现
        class: builtin
        name: scan_markdown_files

# Phase 2: 引用 Capability
workflow:
  steps:
    - id: analyze
      capability: document_analysis  # ← 只声明能力
      # Resolver 决定用 Routine/Tool/Skill
```

### 实施策略（按需引入）

| 阶段 | 内容 | 触发条件 |
|------|------|----------|
| **Phase 1** | Routine 直接实现 | 当前重构，保持简单 |
| **Phase 2.1** | Tool 支持 | 需要调用外部 API 时 |
| **Phase 2.2** | Skill 支持 | 需要复杂子 workflow 时 |
| **Phase 2.3** | Agent Resolver | 需要 AI 智能决策时 |

### 向后兼容

Phase 2 完全向后兼容 Phase 1：
- `step.routine` 可以自动映射为 `capability` + 单一 Routine 实现
- 现有 Playbook YAML 无需修改

---

## 3. 文件创建/修改清单

### 新建文件（~15 个）

```
crates/decacan-runtime/src/
├── playbook/
│   └── spec/
│       ├── mod.rs
│       ├── entities.rs
│       └── parser.rs
├── routine/
│   ├── trait.rs
│   ├── builtin/
│   │   ├── mod.rs
│   │   ├── scan_markdown.rs
│   │   ├── read_file.rs
│   │   └── ... (其他 routines)
│   └── registry.rs（替换）
├── workflow/
│   ├── engine.rs（新）
│   └── validator.rs
└── contract/
    ├── mod.rs
    ├── contract.rs
    └── schema.rs

crates/decacan-runtime/tests/
├── playbook_spec.rs
├── routine_trait.rs
└── workflow_engine.rs

crates/decacan-runtime/fixtures/
├── summary_playbook.yaml
└── discovery_playbook.yaml
```

### 修改文件（~10 个）

```
crates/decacan-runtime/src/
├── playbook/
│   ├── mod.rs（添加 spec 模块导出）
│   ├── lifecycle.rs（PlaybookDraft/Version.spec 类型改为 PlaybookSpec）
│   └── execution.rs（使用新编译器）
├── workflow/
│   ├── mod.rs（修改实体定义）
│   ├── entity.rs（修改 Workflow/WorkflowStep）
│   ├── compiler.rs（完全重写）
│   └── step.rs（可选：移除或重构）
├── routine/
│   ├── mod.rs（添加 trait 模块）
│   └── executor.rs（完全重写，或使用新 engine）
└── lib.rs（添加新模块导出）
```

---

## 4. 测试策略

### 单元测试

- [ ] PlaybookSpec 解析测试
- [ ] Routine trait 实现测试
- [ ] Workflow 编译测试
- [ ] 契约验证测试
- [ ] 执行引擎测试

### 集成测试

- [ ] 端到端：YAML → Workflow → Execution
- [ ] 现有 playbook 向后兼容
- [ ] 错误处理测试

### 回归测试

- [ ] 所有现有测试通过
- [ ] 性能基准（对比重构前后）

---

## 5. 风险缓解

| 风险 | 缓解措施 |
|------|----------|
| 重构范围过大 | 分 4 周逐步实施，每周可独立交付 |
| 破坏现有功能 | 保持 API 兼容，全面回归测试 |
| 性能下降 | Benchmark 对比，必要时优化 |
| 团队不熟悉新架构 | 详细文档 + Code Review |

---

## 6. 成功标准

- [ ] Playbook YAML spec 能正常解析执行
- [ ] 所有现有 77+ 测试通过
- [ ] 可以添加新 playbook 不修改代码
- [ ] 契约验证正常工作
- [ ] 知识系统有明确集成点（StepDefinition.knowledge_context）

---

**文档状态：** ✅ 已批准  
**下一步：** 开始 Week 1 实施或进一步细化特定任务

**请确认：**
1. 是否开始实施 Week 1 Task 1.1？
2. 或者需要调整计划中的任何部分？