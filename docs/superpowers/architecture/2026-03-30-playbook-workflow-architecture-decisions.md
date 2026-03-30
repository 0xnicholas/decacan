# Decacan Playbook/Workflow 重构 - 最终架构设计决策书

Date: 2026-03-30
Status: Architecture Finalized - Ready for Implementation
Related Plans: 
- 2026-03-30-decacan-playbook-workflow-refactor.md (实施计划)
- 2026-03-30-decacan-knowledge-learning-design.md (知识系统)

---

## 1. 架构设计原则

### 核心原则：先简化，后抽象

**Phase 1（4周）：** 架构重构 + Capability 语法（简化版）
- 强制使用 Capability 声明
- 但直接映射到 Routine（无复杂解析）
- 为 Phase 2 预留所有扩展接口

**Phase 2（未来）：** Capability 抽象层（完整版）
- Routine/Tool/Skill 多实现类型
- Agent 智能决策
- 高级解析策略

**Phase 3（未来）：** 知识学习系统集成

---

## 2. 实体结构定义（已确认）

### 2.1 PlaybookSpec

```rust
/// Playbook 完整规范（YAML 解析后的结构化数据）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookSpec {
    /// 元数据
    pub metadata: PlaybookMetadata,
    
    /// 输入定义
    pub input_schema: InputSchema,
    
    /// 工作流定义（包含 Capability 引用）
    pub workflow: WorkflowDefinition,
    
    /// 能力引用声明
    pub capability_refs: CapabilityRefs,
    
    /// 输出契约
    pub output_contract: OutputContract,
    
    /// 策略配置
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
```

### 2.2 WorkflowDefinition（关键变更）

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkflowDefinition {
    /// 步骤列表
    pub steps: Vec<WorkflowStep>,
    
    /// 默认实现策略（Phase 2 使用）
    /// Phase 1: 简单忽略或使用默认
    pub default_implementation_strategy: ImplementationStrategy,
    
    /// 错误处理策略
    pub error_handling: ErrorHandlingStrategy,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkflowStep {
    /// 步骤唯一标识
    pub id: String,
    
    /// 显示名称
    pub name: String,
    
    /// 描述
    pub description: String,
    
    /// ===== 核心变更：Capability 引用（强制）=====
    /// Phase 1: 直接映射到 Routine
    /// Phase 2: 通过 Resolver 解析为 Routine/Tool/Skill
    pub capability: CapabilityRef,
    
    /// 实现提示（Phase 2 可选）
    /// 表达偏好但不强制
    pub implementation_hint: Option<ImplementationHint>,
    
    /// 回退策略（Phase 2 可选）
    /// 失败时如何处理
    pub fallback_strategy: FallbackStrategy,
    
    /// 输入映射（模板表达式）
    pub input_mapping: InputMapping,
    
    /// 输出映射
    pub output_mapping: OutputMapping,
    
    /// 步骤间转换
    pub transition: Transition,
}

/// Capability 引用
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CapabilityRef {
    /// Capability ID（如 "filesystem.scan"）
    pub id: String,
    
    /// 版本要求
    pub version: String,
}

impl CapabilityRef {
    pub fn new(id: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            version: "1.0.0".to_string(),
        }
    }
}
```

### 2.3 Capability Resolver Trait（核心接口）

```rust
/// Capability Resolver Trait
/// 负责将 Capability 引用解析为具体实现
/// 
/// Phase 1: SimpleResolver（直接查表）
/// Phase 2: AgentGuidedResolver（智能决策）
#[async_trait]
pub trait CapabilityResolver: Send + Sync {
    /// 解析 capability 为具体实现
    /// 
    /// # Arguments
    /// * `capability` - 要解析的 capability 引用
    /// * `context` - 解析上下文（包含执行环境、约束等）
    ///
    /// # Returns
    /// * `ResolutionResult` - 解析结果，包含实现和元数据
    async fn resolve(
        &self,
        capability: &CapabilityRef,
        context: &ResolutionContext,
    ) -> Result<ResolutionResult, ResolveError>;
    
    /// 获取 resolver 信息
    fn resolver_info(&self) -> ResolverInfo;
}

/// 解析结果
#[derive(Debug, Clone)]
pub struct ResolutionResult {
    /// 选中的实现
    pub implementation: ImplementationRef,
    
    /// 选择理由（用于调试和审计）
    pub reasoning: String,
    
    /// 置信度（0.0-1.0）
    pub confidence: f64,
    
    /// 备选方案（失败时使用）
    pub fallbacks: Vec<ImplementationRef>,
    
    /// 元数据
    pub metadata: ResolutionMetadata,
}

/// 实现引用
#[derive(Debug, Clone)]
pub enum ImplementationRef {
    /// 代码实现（Phase 1 唯一支持）
    Routine(RoutineRef),
    
    /// 外部工具（Phase 2）
    Tool(ToolRef),
    
    /// 子工作流技能（Phase 2）
    Skill(SkillRef),
}

/// Resolver 信息
#[derive(Debug, Clone)]
pub struct ResolverInfo {
    /// Resolver 名称
    pub name: String,
    
    /// Resolver 版本
    pub version: String,
    
    /// 支持的实现类型
    pub supported_implementation_types: Vec<String>,
}

/// 解析上下文
#[derive(Debug, Clone)]
pub struct ResolutionContext {
    /// 执行环境
    pub execution_context: ExecutionContext,
    
    /// 用户偏好
    pub preferences: UserPreferences,
    
    /// 资源约束
    pub constraints: ResourceConstraints,
    
    /// 历史数据（Phase 2 用于学习）
    pub history: Option<ExecutionHistory>,
}

/// 解析错误
#[derive(Debug, thiserror::Error)]
pub enum ResolveError {
    #[error("capability not found: {0}")]
    CapabilityNotFound(String),
    
    #[error("no suitable implementation for capability: {0}")]
    NoSuitableImplementation(String),
    
    #[error("constraint violation: {0}")]
    ConstraintViolation(String),
    
    #[error("resolution failed: {0}")]
    ResolutionFailed(String),
}
```

### 2.4 SimpleResolver（Phase 1 实现）

```rust
/// Phase 1 简单实现
/// 直接查表映射 capability → routine
pub struct SimpleResolver {
    /// capability_id → routine_ref 映射表
    /// 由 RoutineRegistry 自动构建
    capability_to_routine: HashMap<String, RoutineRef>,
}

impl SimpleResolver {
    pub fn new(registry: &RoutineRegistry) -> Self {
        let mut mapping = HashMap::new();
        
        // 从 registry 自动构建映射
        for (routine_type, routine) in registry.routines() {
            if let Some(capability) = routine.provides_capability() {
                mapping.insert(
                    capability.id,
                    RoutineRef {
                        capability_class: routine_type.capability_class.clone(),
                        routine_name: routine_type.routine_name.clone(),
                        version: routine_type.version.clone(),
                    }
                );
            }
        }
        
        Self {
            capability_to_routine: mapping,
        }
    }
}

#[async_trait]
impl CapabilityResolver for SimpleResolver {
    async fn resolve(
        &self,
        capability: &CapabilityRef,
        _context: &ResolutionContext,
    ) -> Result<ResolutionResult, ResolveError> {
        let routine_ref = self.capability_to_routine
            .get(&capability.id)
            .ok_or_else(|| ResolveError::CapabilityNotFound(capability.id.clone()))?;
        
        Ok(ResolutionResult {
            implementation: ImplementationRef::Routine(routine_ref.clone()),
            reasoning: format!("SimpleResolver: direct mapping to {}", routine_ref.routine_name),
            confidence: 1.0,
            fallbacks: vec![], // Phase 1 无备选
            metadata: ResolutionMetadata {
                resolver_version: "1.0.0".to_string(),
                decision_time_ms: 0,
                context_hash: String::new(),
            },
        })
    }
    
    fn resolver_info(&self) -> ResolverInfo {
        ResolverInfo {
            name: "SimpleResolver".to_string(),
            version: "1.0.0".to_string(),
            supported_implementation_types: vec!["routine".to_string()],
        }
    }
}
```

### 2.5 Routine Trait（自我声明）

```rust
#[async_trait]
pub trait Routine: Send + Sync {
    /// 返回 Routine 类型标识
    fn routine_type(&self) -> RoutineType;
    
    /// ===== 关键：自我声明 Capability =====
    /// 默认实现：routine_name 即为 capability_id
    fn provides_capability(&self) -> Option<CapabilityRef> {
        let routine_type = self.routine_type();
        Some(CapabilityRef::new(&format!("{}.{}", 
            routine_type.capability_class,
            routine_type.routine_name
        )))
    }
    
    /// 输入契约
    fn input_contract(&self) -> &Contract;
    
    /// 输出契约
    fn output_contract(&self) -> &Contract;
    
    /// 执行
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

/// Routine 引用
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RoutineRef {
    pub capability_class: String,
    pub routine_name: String,
    pub version: String,
}
```

---

## 3. 两阶段架构详解

### 3.1 Phase 1：简化版（4周实施）

**目标：**
- 强制使用 Capability 语法（破坏性变更）
- 但直接映射到 Routine（保持简单）
- 建立完整的架构基础

**架构图：**
```
PlaybookSpec
└── workflow
    └── steps
        └── capability: "filesystem.scan"  ← 强制语法
            └── SimpleResolver.resolve()
                └── 查表 → Routine "builtin.scan_markdown_files"
                    └── Routine.execute()
```

**特点：**
- ✅ Capability 语法强制
- ✅ SimpleResolver 直接查表
- ✅ Routine 自我声明 capability
- ⚠️ 只有 Routine 实现类型
- ⚠️ 无智能决策
- ✅ 为 Phase 2 预留所有接口

### 3.2 Phase 2：完整版（未来）

**目标：**
- 实现真正的 Capability 抽象层
- 支持 Routine/Tool/Skill 多种实现
- Agent 智能决策

**架构图：**
```
PlaybookSpec
└── workflow
    ├── default_implementation_strategy: "cost_optimized"
    └── steps
        └── capability: "filesystem.scan"
            └── AgentGuidedResolver.resolve()
                ├── 考虑成本、性能、上下文
                ├── 咨询 Agent（可选）
                └── 决策 → Implementation
                    ├── Routine "parallel_scanner"（本地并行）
                    ├── Tool "cloud_scanner_api"（云端）
                    └── Skill "distributed_scan"（分布式子流程）
```

**新增组件：**
- **AgentGuidedResolver：** 使用 Agent 做智能决策
- **Tool：** 外部 API 调用
- **Skill：** 子 workflow 组合
- **Advanced Resolution Strategies：** 成本优化、性能优化等

### 3.3 Agent 与 Resolver 的关系

```rust
/// Agent 角色（Phase 2+）
pub trait PlaybookAgent: Send + Sync {
    /// 角色 1：作为 ResolutionStrategy
    /// Resolver 调用 Agent 做决策
    fn as_resolution_strategy(&self
    ) -> Option<&dyn ResolutionStrategy>;
    
    /// 角色 2：作为 Supervisor
    /// 指挥整个工作流执行
    async fn supervise_workflow(
        &self,
        workflow: &Workflow,
        ctx: &mut Context,
    ) -> Result<(), AgentError>;
    
    /// 角色 3：直接执行（可选）
    async fn execute_step(
        &self,
        step: &WorkflowStep,
        ctx: &mut Context,
    ) -> Result<StepResult, AgentError>;
}

/// ResolutionStrategy Trait
/// Agent 可以实现此 trait 供 Resolver 使用
#[async_trait]
pub trait ResolutionStrategy: Send + Sync {
    /// 在多个实现中选择
    async fn select_implementation(
        &self,
        options: Vec<ImplementationRef>,
        context: &ResolutionContext,
    ) -> Result<Selection, StrategyError>;
}

/// AgentGuidedResolver（Phase 2）
pub struct AgentGuidedResolver {
    /// 基础 resolver（当 Agent 不可用时回退）
    base_resolver: Box<dyn CapabilityResolver>,
    
    /// 可选的 Agent（作为策略）
    agent_strategy: Option<Arc<dyn ResolutionStrategy>>,
    
    /// 配置
    config: AgentGuidedResolverConfig,
}

impl AgentGuidedResolver {
    async fn resolve(
        &self,
        capability: &CapabilityRef,
        context: &ResolutionContext,
    ) -> Result<ResolutionResult, ResolveError> {
        // 1. 获取所有候选实现
        let candidates = self.get_candidates(capability)?;
        
        // 2. 如果有 Agent，使用 Agent 决策
        if let Some(strategy) = &self.agent_strategy {
            if self.should_consult_agent(&candidates, context) {
                let selection = strategy
                    .select_implementation(candidates, context)
                    .await
                    .map_err(|e| ResolveError::ResolutionFailed(e.to_string()))?;
                
                return Ok(self.build_result(selection));
            }
        }
        
        // 3. 否则使用基础 resolver
        self.base_resolver.resolve(capability, context).await
    }
}
```

---

## 4. YAML Spec 格式（Phase 1）

```yaml
# summary.yaml
metadata:
  title: "总结资料"
  description: "扫描 markdown 文件并生成摘要"
  mode: standard
  version: "1.0.0"
  tags: ["文档处理", "摘要"]

input_schema:
  - name: source_directory
    type: path
    required: true
    description: "包含 markdown 文件的目录"

workflow:
  # Phase 1: 字段存在但被忽略
  # Phase 2: 用于默认策略
  default_implementation_strategy: prefer_local
  
  steps:
    - id: scan
      name: 扫描文件
      description: "扫描工作区中的 markdown 文件"
      
      # ===== 核心变更：强制使用 capability =====
      capability: filesystem.scan
      
      # Phase 2 可选字段：
      # implementation_hint:
      #   type: routine
      #   name: parallel_scanner
      # fallback_strategy: retry_then_alternative
      
      input_mapping:
        directory: "{{ input.source_directory }}"
        recursive: "{{ input.recursive | default(false) }}"
      
      transition:
        next: read
    
    - id: read
      name: 读取内容
      capability: filesystem.read
      transition:
        next: analyze
    
    - id: analyze
      name: 分析主题
      capability: llm.summarize
      transition:
        conditional:
          - condition: "output.topics.length > 0"
            then: generate
          - condition: "output.topics.length == 0"
            then: end
    
    - id: generate
      name: 生成摘要
      capability: content.generate
      transition:
        next: write
    
    - id: write
      name: 写入输出
      capability: filesystem.write
      transition:
        next: register
    
    - id: register
      name: 注册产物
      capability: artifact.register
      transition:
        end

capability_refs:
  # Routine 通过 provides_capability() 自我声明
  # 这里声明此 Playbook 需要的能力（用于验证和权限）
  routines:
    - filesystem.scan
    - filesystem.read
    - llm.summarize
    - content.generate
    - filesystem.write
    - artifact.register

output_contract:
  primary_artifact:
    type: markdown_document
    path: "output/summary.md"
    schema: summary_schema_v1
  backup_policy: versioned
```

---

## 5. 关键设计决策总结

| 决策项 | 选择 | 理由 |
|--------|------|------|
| **两阶段策略** | Phase 1: 简化 + 语法, Phase 2: 完整抽象 | 先重构架构，后添加复杂度 |
| **Capability 介入层级** | C（两者结合） | Workflow 级别策略 + Step 级别覆盖 |
| **向后兼容** | A（强制 Capability） | 架构纯粹，统一抽象层 |
| **破坏性变更处理** | 延到 Phase 2 | Phase 1 完成后再迁移现有 Playbook |
| **Capability → Routine 映射** | 自我声明 | Routine 通过 `provides_capability()` 声明 |
| **Resolver 接口** | Trait | `CapabilityResolver` trait，支持多实现 |
| **Agent 与 Resolver 关系** | 策略模式 | Resolver 是机制，Agent 是策略（USE 模式） |
| **Agent 角色** | 多角色 | ResolutionStrategy + Supervisor + Executor |
| **Tool/Skill 支持** | Phase 2 | Phase 1 预留接口，只实现 Routine |
| **知识系统集成** | Phase 3 | 先完成基础架构，再集成知识学习 |

---

## 6. 实施路线图

### Phase 1（4周）- 当前

**Week 1: 基础架构**
- [ ] Task 1.1: PlaybookSpec 类型和 YAML 解析器
- [ ] Task 1.2: Routine Trait 和自我声明
- [ ] Task 1.3: SimpleResolver 实现
- [ ] Task 1.4: WorkflowEngine 重构

**Week 2: 契约系统**
- [ ] Contract Trait 定义
- [ ] JSON Schema 验证
- [ ] 输入/输出契约验证

**Week 3: 高级特性**
- [ ] 条件分支（Conditional Transition）
- [ ] 重试机制（Retry Policy）
- [ ] 错误处理策略

**Week 4: 测试与文档**
- [ ] 全面测试
- [ ] 架构文档
- [ ] Phase 2 准备

### Phase 2（未来）- Capability 抽象层

- [ ] Tool 实现类型
- [ ] Skill 实现类型
- [ ] AgentGuidedResolver
- [ ] Advanced Resolution Strategies
- [ ] 现有 Playbook 迁移

### Phase 3（未来）- 知识学习系统

- [ ] 与 Capability 系统集成
- [ ] 知识卡片注入
- [ ] 自迭代学习

---

## 7. 文件清单

### Phase 1 新建文件

```
crates/decacan-runtime/src/
├── playbook/
│   ├── spec/
│   │   ├── mod.rs
│   │   ├── entities.rs          # PlaybookSpec, WorkflowDefinition, etc.
│   │   └── parser.rs            # YAML 解析
│   └── capability/              # 新增模块
│       ├── mod.rs
│       ├── resolver.rs          # CapabilityResolver trait, SimpleResolver
│       └── context.rs           # ResolutionContext
├── routine/
│   ├── trait.rs                 # Routine trait（含 provides_capability）
│   ├── registry.rs              # RoutineRegistry（自动构建 capability 映射）
│   └── builtin/
│       ├── mod.rs
│       └── *.rs                 # 各 Routine 实现
└── workflow/
    ├── engine.rs                # WorkflowEngine（使用 CapabilityResolver）
    └── compiler.rs              # 新编译器

crates/decacan-runtime/tests/
├── playbook_spec_parsing.rs
├── capability_resolver.rs
└── workflow_execution.rs

crates/decacan-runtime/fixtures/
├── summary_playbook.yaml        # Phase 1 示例（需后续改为 capability 语法）
└── discovery_playbook.yaml
```

### Phase 1 修改文件

```
crates/decacan-runtime/src/
├── playbook/
│   ├── mod.rs                   # 添加 spec, capability 模块
│   ├── lifecycle.rs             # PlaybookDraft/Version.spec 改为 PlaybookSpec
│   └── execution.rs             # 使用新编译器和引擎
├── workflow/
│   ├── mod.rs                   # 修改导出
│   ├── entity.rs                # Workflow 实体简化
│   ├── compiler.rs              # 完全重写
│   └── step.rs                  # 移除或简化
├── routine/
│   ├── mod.rs                   # 添加 trait 模块
│   ├── entity.rs                # 修改为 RoutineType
│   └── executor.rs              # 改为使用 WorkflowEngine
└── lib.rs                       # 添加新模块导出
```

---

## 8. 成功标准

### Phase 1 成功标准

- [ ] Playbook YAML 使用 capability 语法能正常解析
- [ ] SimpleResolver 正确映射 capability → routine
- [ ] Routine 自我声明机制工作正常
- [ ] WorkflowEngine 使用 CapabilityResolver 执行
- [ ] 所有现有测试通过（向后兼容检查）
- [ ] 契约验证正常工作
- [ ] 为 Phase 2 预留的接口完整且可用

### Phase 2 成功标准

- [ ] Tool/Skill 实现类型可用
- [ ] AgentGuidedResolver 能智能决策
- [ ] 同一 Capability 可选择不同实现
- [ ] 现有 2 个 Playbook 成功迁移
- [ ] 知识系统集成点可用

---

## 9. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 破坏性变更导致迁移困难 | 高 | Phase 1 先完成架构，Phase 2 再迁移；提供迁移工具 |
| Routine 自我声明机制复杂 | 中 | 提供宏简化声明；良好文档 |
| CapabilityResolver 性能问题 | 中 | 缓存解析结果；SimpleResolver 本身是 O(1) |
| Agent 与 Resolver 耦合过紧 | 中 | 清晰分离：Resolver 是机制，Agent 是策略 |

---

## 10. 附录：关键代码片段

### A. Routine 自我声明示例

```rust
pub struct ScanMarkdownFilesRoutine;

#[async_trait]
impl Routine for ScanMarkdownFilesRoutine {
    fn routine_type(&self) -> RoutineType {
        RoutineType::new("builtin", "scan_markdown_files", "1.0.0")
    }
    
    // 使用默认 provides_capability()
    // 自动声明 capability: "builtin.scan_markdown_files"
    
    fn input_contract(&self) -> &Contract {
        &SCAN_INPUT_CONTRACT
    }
    
    fn output_contract(&self) -> &Contract {
        &SCAN_OUTPUT_CONTRACT
    }
    
    async fn execute(
        &self,
        ctx: &mut RoutineContext,
        input: Value,
    ) -> Result<Value, RoutineError> {
        // 实现...
    }
}
```

### B. WorkflowEngine 执行流程

```rust
impl WorkflowEngine {
    pub async fn execute(
        &self,
        workflow: &Workflow,
        mut context: ExecutionContext,
    ) -> Result<ExecutionResult, ExecutionError> {
        let mut current_step_id = workflow.first_step_id()?;
        
        while let Some(step_id) = current_step_id {
            let step = workflow.get_step(&step_id)?;
            
            // 1. 解析 Capability
            let resolution = self.capability_resolver
                .resolve(&step.capability, &context.to_resolution_context())
                .await?;
            
            // 2. 执行实现
            let result = match resolution.implementation {
                ImplementationRef::Routine(routine_ref) => {
                    let routine = self.routine_registry.get(&routine_ref)?;
                    self.execute_routine(routine, &step, &mut context).await?
                }
                // Phase 2: Tool, Skill
            };
            
            // 3. 决定下一步
            current_step_id = self.determine_next_step(
                step, &result, &context
            )?;
        }
        
        Ok(ExecutionResult::success(context))
    }
}
```

---

**文档状态：** ✅ 最终架构已确认  
**创建日期：** 2026-03-30  
**最后更新：** 2026-03-30  
**版本：** 1.0.0  

**相关文档：**
- 实施计划：`docs/superpowers/plans/2026-03-30-decacan-playbook-workflow-refactor.md`
- 知识系统设计：`docs/superpowers/specs/2026-03-30-decacan-knowledge-learning-design.md`

**下一步：** 开始 Phase 1 Week 1 实施
