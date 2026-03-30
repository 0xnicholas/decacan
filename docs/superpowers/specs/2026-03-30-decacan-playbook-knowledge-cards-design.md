# Decacan Playbook 知识卡片系统设计

Date: 2026-03-30
Stage: Design
Status: Draft - Pending Review

## 目标

将 Decacan 的 Playbook 从"可执行脚本"升级为"可执行的知识容器"，通过知识卡片系统实现：

1. **可观测** - 每次执行可追溯，失败可精准归因
2. **可演化** - 专家可维护，Agent 可理解和调用
3. **可迭代** - 基于执行数据持续优化

## 核心概念

### Playbook 定位

Playbook 不是文档，而是**可执行的知识容器**，同时满足：
- **人能读懂** - 专家可以维护和优化
- **机器能调用** - Agent 可以检索、理解和执行
- **可以迭代** - 失败了知道改哪里

### 知识卡片

知识卡片是 Agent 的**判断坐标系**：
- 提供结构化的约束和判断维度
- 让 LLM 对照具体阈值和维度推理
- 结论有来源可追溯（通过 `card_ref`）
- 答错了精准修改卡片，不改整个 prompt

## Playbook 完整结构

### 1. Draft 级别（可编辑）

```yaml
# metadata
metadata:
  title: "总结资料"
  description: "扫描 markdown 文件并生成结构化摘要"
  version: "1.0.0"
  mode: standard  # standard | discovery
  author: "builtin"
  tags: ["文档处理", "摘要生成", "知识提取"]

# 输入定义
input_schema:
  - key: source_directory
    type: path
    required: true
    label: "源目录"
    description: "包含 markdown 文件的目录路径"
  - key: output_format
    type: enum
    options: [markdown, json]
    default: markdown
    label: "输出格式"

# 能力声明（绑定具体实现）
capability_refs:
  routines:
    - builtin.scan_markdown_files
    - builtin.read_file_content
    - builtin.extract_topics
    - builtin.generate_summary
  tools:
    - builtin.workspace.read
    - builtin.workspace.write
  validators:
    - builtin.output_contract.summary

# 执行流程
workflow:
  steps:
    - id: scan
      name: "扫描文件"
      routine: builtin.scan_markdown_files
      input: 
        directory: "{{ input.source_directory }}"
      output: files
      
    - id: read
      name: "读取内容"
      routine: builtin.read_file_content
      foreach: "{{ steps.scan.output.files }}"
      output: contents
      
    - id: extract
      name: "提取主题"
      routine: builtin.extract_topics
      input:
        contents: "{{ steps.read.output.contents }}"
      output: topics
      
    - id: generate
      name: "生成摘要"
      routine: builtin.generate_summary
      input:
        topics: "{{ steps.extract.output.topics }}"
        format: "{{ input.output_format }}"
      output: summary
      
    - id: write
      name: "写入输出"
      routine: builtin.write_output
      input:
        content: "{{ steps.generate.output.summary }}"
        path: "output/summary.md"

# 输出契约
output_contract:
  primary_artifact:
    type: markdown_document
    path: "output/summary.md"
    schema: summary_schema_v1
  backup_policy: versioned
  overwrite_rule: allow_if_newer

# 执行配置
execution_profile:
  type: single
  timeout_seconds: 300
  retry_policy:
    max_retries: 3
    backoff: exponential

# 策略配置
policy_profile:
  allowed_capability_classes: [builtin]
  write_policy: workspace_scoped
  approval_policy: none
  resource_limits:
    max_file_size: 10MB
    max_files: 100

# 知识卡片引用（新增）
knowledge_card_refs:
  - card_id: "card-markdown-quality"
    binding: "system"
    required: true
    
  - card_id: "card-file-handling"
    binding: "rag"
    trigger: "file_count > 50"
    
  - card_id: "card-summary-validation"
    binding: "validation"
```

### 2. 知识卡片结构

```yaml
knowledge_cards:
  - id: "card-markdown-quality"
    name: "markdown_summary_quality"
    version: "1.0.0"
    
    # 方式一：System Prompt 注入（结构性约束）
    system_constraints:
      priority: "high"  # high/medium/low
      rules:
        - "必须覆盖所有输入文件的主题，不能遗漏"
        - "相似主题必须合并，不能重复"
        - "每个主题必须标注来源文件"
      output_format:
        structure: "hierarchical"
        sections: ["overview", "themes", "details"]
        required_fields: ["confidence_score", "source_files", "coverage_assessment"]
    
    # 方式二：RAG 检索注入（动态知识补充）
    retrieval:
      trigger_conditions:
        - "用户提到'整理笔记'"
        - "输入包含 >10 个 markdown 文件"
        - "输出格式为 'summary'"
      semantic_description: "评估摘要质量的维度：完整性、准确性、结构化、可追溯性"
      embedding_tags: ["quality_assessment", "summary", "markdown"]
    
    # 方式三：结构化校验（Output Contract 对照）
    validation:
      schema:
        type: "object"
        required: ["themes", "coverage_assessment"]
      rules:
        - field: "themes"
          check: "array.length > 0"
          error_msg: "必须至少识别一个主题"
        - field: "coverage_assessment"
          check: "enum:[complete,partial,gaps]"
          error_msg: "必须明确说明覆盖度评估"
        - field: "confidence_score"
          check: "number >= 0 && number <= 1"
          error_msg: "置信度必须在 0-1 之间"
      gaps_handling: "如果无法评估某个维度，在 gaps 字段说明原因"
    
    # 追溯与迭代
    metadata:
      created_at: "2024-03-30"
      updated_at: "2024-03-30"
      author: "expert-team"
      usage_stats:
        invocation_count: 156
        success_rate: 0.92
        last_failure_at: "2024-03-28"
        common_failures:
          - type: "coverage_assessment_missing"
            count: 12
            fix_suggestion: "增加默认值处理"
```

### 3. Version 级别（发布时冻结）

```rust
pub struct PlaybookVersion {
    pub playbook_version_id: Uuid,
    pub playbook_handle_id: String,
    pub version_number: u32,
    
    // 冻结的规范文档
    pub spec_document: String,
    
    // 编译后的结构
    pub compiled_workflow: Workflow,
    pub resolved_bindings: CapabilityBindings,
    
    // 冻结的知识卡片（版本锁定）
    pub frozen_cards: Vec<FrozenKnowledgeCard>,
    pub card_retrieval_index: CardRetrievalIndex,  // 预编译的 RAG 索引
    
    // 健康报告
    pub validation_report: DraftHealthReport,
    
    pub published_at: OffsetDateTime,
}

pub struct FrozenKnowledgeCard {
    pub card_id: String,
    pub card_version: String,
    pub binding_type: CardBindingType,  // System/Rag/Validation
    pub trigger_condition: Option<String>,
    pub system_constraints: Option<SystemConstraints>,
    pub retrieval_config: Option<RetrievalConfig>,
    pub validation_rules: Vec<ValidationRule>,
}

// 预编译的 RAG 检索索引
// 在 Playbook Publish 时生成，避免每次执行时重新计算嵌入向量
pub struct CardRetrievalIndex {
    // 嵌入向量矩阵（每个 RAG 卡片一个向量）
    pub embeddings: Vec<Vec<f32>>,
    
    // 卡片 ID 映射（embeddings[i] 对应 card_ids[i]）
    pub card_ids: Vec<String>,
    
    // 触发条件预编译结果
    // 将字符串条件编译为可执行表达式树
    pub compiled_triggers: Vec<CompiledTrigger>,
    
    // 语义描述文本（用于调试和日志）
    pub semantic_descriptions: Vec<String>,
    
    // 索引元数据
    pub index_version: String,  // 索引格式版本
    pub created_at: OffsetDateTime,
    pub card_count: usize,
}

// 预编译的触发条件
pub struct CompiledTrigger {
    pub card_id: String,
    // 使用 evalexpr 或类似库编译的条件表达式
    pub condition_expr: Expression,
    // 原始条件字符串（用于调试）
    pub original_condition: String,
}

// 使用示例：
// 1. Publish 时：为所有 RAG 类型的 frozen_cards 生成嵌入向量，
//    编译 trigger_conditions，存储到 card_retrieval_index
// 2. 执行时：直接加载预计算的数据，无需再次调用嵌入模型，
//    通过 compiled_triggers 快速评估条件，通过 embeddings 做相似度匹配
```

## 知识卡片三种使用方式

### 方式一：System Prompt 注入

**时机：** 任务启动时
**机制：** 按优先级排序注入
**用途：** 全局约束和格式规范

```rust
fn build_system_prompt(version: &PlaybookVersion) -> String {
    let mut prompt = String::new();
    
    // 按优先级排序
    let system_cards: Vec<_> = version.frozen_cards
        .iter()
        .filter(|c| c.binding_type == CardBindingType::System)
        .sorted_by(|a, b| b.priority.cmp(&a.priority));
    
    for card in system_cards {
        prompt.push_str(&format!("\n## {}\n", card.name));
        
        // 注入规则
        for rule in &card.system_constraints.rules {
            prompt.push_str(&format!("- {}\n", rule));
        }
        
        // 注入格式要求
        prompt.push_str(&format!(
            "\n输出格式要求：{:?}\n",
            card.system_constraints.output_format
        ));
    }
    
    prompt
}
```

**示例效果：**
```
## markdown_summary_quality
- 必须覆盖所有输入文件的主题，不能遗漏
- 相似主题必须合并，不能重复
- 每个主题必须标注来源文件

输出格式要求：{
  structure: "hierarchical",
  sections: ["overview", "themes", "details"],
  required_fields: ["confidence_score", "source_files"]
}
```

### 方式二：RAG 检索注入

**时机：** 每个 Step 执行前
**机制：** 语义相似度 + 触发条件
**用途：** 动态知识补充

```rust
async fn retrieve_context_cards(
    retriever: &CardRetriever,
    user_input: &str,
    execution_context: &ExecutionContext,
) -> Vec<KnowledgeCard> {
    // 1. 获取查询的嵌入向量
    let query_embedding = embed(user_input).await;
    
    // 2. 筛选 RAG 类型的卡片，并评估触发条件
    let candidates: Vec<_> = retriever.cards
        .iter()
        .filter(|c| c.binding_type == CardBindingType::Rag)
        .filter(|c| {
            // 评估触发条件
            if let Some(ref condition) = c.trigger_condition {
                evaluate_condition(condition, execution_context)
            } else {
                true  // 无条件，总是候选
            }
        })
        .collect();
    
    // 3. 计算语义相似度
    let scored: Vec<_> = candidates
        .into_iter()
        .map(|c| {
            let similarity = cosine_similarity(&query_embedding, &c.embedding);
            (c, similarity)
        })
        .filter(|(_, score)| *score > 0.7)  // 阈值过滤
        .sorted_by(|a, b| b.1.partial_cmp(&a.1).unwrap())
        .take(3)  // 取 top-3
        .map(|(c, _)| c.clone())
        .collect();
    
    // 4. 记录检索日志
    for card in &scored {
        execution_context.log_card_invocation(
            &card.card_id,
            "rag_match",
            &format!("similarity: {:.2}", card.similarity)
        );
    }
    
    scored
}
```

**触发条件示例：**
```yaml
trigger_conditions:
  - "file_count > 50"                    # 上下文变量
  - "input.source_directory contains '/docs'"  # 路径模式
  - "user_intent == 'organize_notes'"    # 意图匹配
```

### 方式三：结构化校验

**时机：** Artifact 生成后
**机制：** 规则引擎校验
**用途：** 输出质量把关

```rust
fn validate_with_cards(
    artifact: &Artifact,
    validators: &[CardValidator],
) -> ValidationResult {
    let mut gaps = vec![];
    let mut card_refs = vec![];
    
    for validator in validators {
        match validator.validate(artifact) {
            Ok(_) => {
                card_refs.push(CardRef {
                    card_id: validator.card_id.clone(),
                    result: "passed",
                    timestamp: now(),
                });
            }
            Err(ValidationError::MissingField { field }) => {
                gaps.push(Gap {
                    dimension: validator.card_name.clone(),
                    missing: field,
                    card_ref: validator.card_id.clone(),
                    severity: "error",
                });
                card_refs.push(CardRef {
                    card_id: validator.card_id.clone(),
                    result: "gap_identified",
                    timestamp: now(),
                });
            }
            Err(ValidationError::RuleFailed { rule, value }) => {
                gaps.push(Gap {
                    dimension: validator.card_name.clone(),
                    violation: rule,
                    current_value: value,
                    card_ref: validator.card_id.clone(),
                    severity: "warning",
                });
                // Agent 需要补充或解释
            }
        }
    }
    
    ValidationResult { 
        passed: gaps.is_empty(), 
        gaps, 
        card_refs 
    }
}
```

**校验规则示例：**
```yaml
validation:
  rules:
    - field: "themes"
      check: "array.length > 0"
      error_msg: "必须至少识别一个主题"
      
    - field: "coverage_assessment"
      check: "enum:[complete,partial,gaps]"
      error_msg: "必须明确说明覆盖度评估"
      
    - field: "confidence_score"
      check: "number >= 0.7"
      warning_msg: "置信度低于 0.7，建议增加上下文"
```

## 执行追踪与归因系统（Phase 1）

### 任务状态定义

```rust
pub enum TaskStatus {
    // 成功
    Succeeded,
    
    // 进行中
    Running,
    Paused,  // 等待审批/输入
    
    // 失败（需要归因）
    Failed(FailureCategory),
    
    // 非失败（不归因）
    Cancelled,  // 用户主动取消
}

pub enum FailureCategory {
    Runtime(RuntimeError),
    Contract(ContractViolation),
    Quality(QualityIssue),
    Policy(PolicyViolation),
    PartialCompletion(PartialFailure),  // 部分完成
}
```

### Step Trace 系统

```rust
pub struct StepTrace {
    pub step_id: String,
    pub step_name: String,
    pub sequence: u32,
    
    // 输入输出（脱敏后）
    pub input_snapshot: Value,
    pub output_snapshot: Value,
    
    // 执行元数据
    pub started_at: OffsetDateTime,
    pub completed_at: OffsetDateTime,
    pub duration_ms: u64,
    pub retry_count: u32,
    
    // 资源消耗
    pub resources_used: ResourceMetrics,
    
    // 状态
    pub status: StepStatus,
    pub error: Option<StepError>,
    
    // 卡片使用记录
    pub invoked_cards: Vec<CardInvocation>,
}

pub struct TaskExecutionTrace {
    pub task_id: String,
    pub playbook_version_id: Uuid,
    pub workspace_id: String,
    
    pub steps: Vec<StepTrace>,
    pub overall_status: TaskStatus,
    
    pub total_duration_ms: u64,
    pub step_count: u32,
    pub failed_step_index: Option<u32>,
    
    pub created_at: OffsetDateTime,
}
```

### 失败归因引擎

```rust
pub struct FailureAttribution {
    pub task_id: String,
    pub failed_step_id: String,
    pub failure_category: FailureCategory,
    
    // 归因目标
    pub attribution: AttributionTarget,
    
    // 分析
    pub root_cause: String,
    pub suggested_fix: String,
    pub relevant_card_refs: Vec<String>,
}

pub enum AttributionTarget {
    DraftCapabilityRef {
        ref_name: String,
        location: String,
    },
    DraftWorkflowStep {
        step_index: u32,
        field: String,
    },
    DraftInputSchema {
        field_name: String,
    },
    DraftOutputContract {
        contract_type: String,
    },
    DraftPolicyProfile {
        policy_name: String,
    },
    KnowledgeCard {
        card_id: String,
        dimension: String,
    },
    RuntimeEnvironment,
}
```

**归因示例：**

```rust
// Runtime 失败归因
FailureCategory::Runtime(RuntimeError::CapabilityNotFound { ref_name }) => {
    FailureAttribution {
        root_cause: "capability_ref 未找到",
        attribution: AttributionTarget::DraftCapabilityRef {
            ref_name: ref_name.clone(),
            location: format!("capability_refs.routines.{}", ref_name),
        },
        suggested_fix: format!(
            "1. 检查 capability_ref '{}' 拼写\n\
             2. 确认该 capability 已注册\n\
             3. 或更换为其他 capability",
            ref_name
        ),
    }
}

// Quality 失败归因
FailureCategory::Quality(QualityIssue::BelowThreshold { dimension, score, threshold }) => {
    FailureAttribution {
        root_cause: "质量不达标",
        attribution: AttributionTarget::KnowledgeCard {
            card_id: find_card_by_dimension(dimension),
            dimension: dimension.clone(),
        },
        suggested_fix: format!(
            "质量维度 '{}' 得分 {} 低于阈值 {}\n\
             建议：\n\
             1. 检查相关知识卡片 '{}'\n\
             2. 增加该维度的约束\n\
             3. 考虑增加预处理步骤",
            dimension, score, threshold, find_card_by_dimension(dimension)
        ),
    }
}

// PartialCompletion 归因
FailureCategory::PartialCompletion(PartialFailure { failed_step, completed_steps }) => {
    FailureAttribution {
        root_cause: "部分数据成功，部分失败",
        attribution: AttributionTarget::DraftWorkflowStep {
            step_index: find_step_index(failed_step),
            field: "error_handling".to_string(),
        },
        suggested_fix: format!(
            "已完成 {} 个步骤，在第 '{}' 步失败\n\
             建议：\n\
             1. 增加分批处理逻辑\n\
             2. 增加错误恢复机制\n\
             3. 或降低单批次数据量",
            completed_steps.len(), failed_step
        ),
    }
}
```

### 版本成功率对比

```rust
pub struct VersionExecutionStats {
    pub playbook_version_id: Uuid,
    pub version_number: u32,
    
    // 执行统计
    pub total_executions: u32,
    pub success_count: u32,
    pub failure_count: u32,
    pub success_rate: f64,
    
    // 时长统计
    pub avg_duration_ms: u64,
    pub min_duration_ms: u64,
    pub max_duration_ms: u64,
    
    // 失败分布
    pub failure_breakdown: HashMap<FailureCategory, u32>,
    
    // Step 级统计
    pub step_stats: Vec<StepStats>,
    
    // 时间窗口
    pub period_start: OffsetDateTime,
    pub period_end: OffsetDateTime,
}
```

## 知识卡片库结构

```
knowledge-cards/
├── cards/                          # YAML 定义文件
│   ├── markdown_summary_quality.yaml
│   ├── file_handling_large_batches.yaml
│   ├── code_review_checklist.yaml
│   ├── document_organization.yaml
│   └── ...
│
├── index/                          # 运行时索引
│   ├── semantic_index.bin          # 嵌入向量索引（FAISS/Annoy）
   ├── trigger_rules/               # 编译后的触发条件
│   │   ├── file_count.condition
│   │   └── path_pattern.condition
│   └── version_manifest.json       # 版本清单
│
├── versions/                       # 版本历史
│   └── {card_id}/
│       ├── v1.0.0.yaml
│       ├── v1.1.0.yaml
│       └── changelog.md
│
└── analytics/                      # 使用统计
    └── {card_id}/
        ├── usage_stats.json
        └── failure_patterns.json
```

## 阶段规划

### Phase 1: 执行追踪与归因（3 周）

**目标：** 让 Playbook 成为可调试的知识容器

**交付物：**
- [ ] Step Trace 记录系统
- [ ] 5 种失败类型的归因引擎
- [ ] 版本成功率统计和对比
- [ ] 失败归因 API 和前端展示

**Week 1:**
- 设计 Trace 数据模型
- 实现 Step 级别的追踪记录
- **存储方案确定：** SQLite 为主（支持复杂查询、索引优化、ACID），JSONL 作为归档备份；表结构包括 task_traces、step_traces、attributions，trace_data 用 JSON 列存储完整 trace

**Week 2:**
- 实现 5 种失败类型的归因逻辑
- 归因到 Draft 具体位置
- 生成修复建议

**Week 3:**
- 版本统计和对比功能
- 前端归因展示页面
- API 完善和测试

### Phase 2: 知识卡片系统（3 周）

**目标：** 实现知识卡片三种使用方式

**交付物：**
- [ ] 知识卡片库基础设施
- [ ] System Prompt 注入
- [ ] RAG 检索注入
- [ ] 结构化校验

**Week 1:**
- 知识卡片数据结构定义
- 卡片库 CRUD API
- 嵌入向量生成和索引

**Week 2:**
- System Prompt 注入实现
- RAG 检索实现（语义相似度）
- 触发条件评估引擎

**Week 3:**
- 结构化校验规则引擎
- Playbook 发布时卡片冻结
- 执行时卡片激活

### Phase 3: 意图驱动创作（2 周）

**目标：** 降低创作门槛，基于数据自动优化

**交付物：**
- [ ] 意图解析引擎
- [ ] 自动生成初始 Draft
- [ ] 基于执行数据优化卡片

**Week 1:**
- 意图解析（专家描述 → 意图结构）
- 匹配推荐知识卡片
- 生成 capability_refs 和 workflow

**Week 2: 数据驱动的卡片优化与生成**
- **归因数据分析模块：** 自动分析 Phase 1 积累的归因数据，识别高频失败模式
  - 按失败类型聚合（Quality/Contract/Runtime）
  - 识别哪些卡片约束经常被违反
  - 生成"卡片-失败"关联热力图
  
- **智能优化建议引擎：** 基于归因数据自动生成卡片改进建议
  - "质量维度 'coverage' 在过去 50 次执行中失败 23 次，建议收紧约束"
  - "缺少对 'empty_directory' 场景的处理，建议新增条件分支卡片"
  - 生成具体的 YAML 修改建议片段
  
- **自动卡片生成器：** 从未覆盖的失败模式自动生成新卡片
  - 识别重复失败但无对应卡片的场景
  - 基于失败归因逆向推导约束规则
  - 生成 draft 卡片供专家审查和发布
  
- **对话式精修界面（MVP）：**
  - 专家审查自动生成的建议
  - 一键应用/修改/拒绝建议
  - 自然语言对话调整卡片（"增加对 CSV 文件的支持"）

## API 设计

### Playbook API

```rust
// 查询任务追踪
GET /api/tasks/{task_id}/trace

// 查询失败归因
GET /api/tasks/{task_id}/attribution

// 查询版本统计
GET /api/playbooks/{handle_id}/versions/{version_id}/stats

// 对比版本
GET /api/playbooks/{handle_id}/version-comparison?v1=1&v2=2
```

### 知识卡片 API

```rust
// 卡片库管理
GET    /api/knowledge-cards              # 列表
POST   /api/knowledge-cards              # 创建
GET    /api/knowledge-cards/{id}         # 详情
PUT    /api/knowledge-cards/{id}         # 更新
DELETE /api/knowledge-cards/{id}         # 删除

// 语义检索
POST /api/knowledge-cards/search         # 语义搜索
{
  "query": "如何处理大批量文件",
  "limit": 5
}

// 执行时激活
GET /api/playbooks/{handle_id}/cards/activated?task_id=xxx  # 获取当前激活的卡片
```

## 关键设计决策

1. **知识卡片独立管理**
   - Playbook 只存引用，不存内容
   - 卡片版本化管理，可复用
   - 发布时冻结卡片版本

2. **简化能力指纹**
   - 复用 `metadata.tags` + `description` + `input_schema` + `output_contract` 做检索
   - 不引入额外的嵌入向量复杂性
   - 语义搜索基于卡片内容本身

3. **失败归因精准化**
   - 5 种独立失败类型
   - 归因到 Draft 具体位置
   - 关联到知识卡片维度

4. **数据驱动迭代**
   - Phase 1 收集执行数据
   - Phase 2/3 基于数据优化
   - 卡片使用统计指导改进

## 非目标

- 复杂 workflow 可视化编辑器（保留 YAML 编辑）
- 多用户协同编辑 Draft
- 远程 Store 同步
- Publish 后台任务队列
- 版本 diff/merge 工具

## 成功标准

- [ ] 失败任务能自动归因到 Draft 具体位置
- [ ] 能查看任意版本的执行统计数据
- [ ] 专家描述意图可生成 80% 完整的 Draft
- [ ] 卡片修改后失败率下降可度量

---

**Review Checklist:**
- [ ] Playbook 结构完整且可行
- [ ] 知识卡片三种使用方式清晰
- [ ] 归因系统覆盖全部 5 种失败类型
- [ ] 阶段划分合理，依赖关系正确
- [ ] 复杂度可控，不过度设计
