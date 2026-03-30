# Decacan 知识学习系统设计

Date: 2026-03-30
Stage: Design
Status: Draft - Pending Approval

## 系统定位

**知识学习系统**是 Decacan 的"智慧大脑"，负责：
- 管理结构化知识（卡片、案例、规则）
- 为 Playbook 执行提供判断依据
- 从执行数据中自我学习迭代
- 支持人机协同的知识维护

## 架构原则

1. **独立边界** - 独立 crate，清晰接口
2. **人机协同** - AI 发现，人工审核
3. **持续进化** - 从失败中学习，从成功中提取模式
4. **多使用者** - Playbook、Agent、人类用户都能访问

## 系统组成

```
decacan-knowledge/ (新 crate)
├── src/
│   ├── lib.rs                    # 模块导出
│   ├── entities/                 # 核心实体
│   │   ├── mod.rs
│   │   ├── card.rs              # 知识卡片
│   │   ├── case.rs              # 执行案例
│   │   ├── rule.rs              # 业务规则
│   │   └── practice.rs          # 最佳实践
│   ├── storage/                 # 存储层
│   │   ├── mod.rs
│   │   └── knowledge_store.rs   # SQLite + 向量索引
│   ├── retrieval/               # 检索引擎
│   │   ├── mod.rs
│   │   ├── semantic.rs          # 语义检索
│   │   └── matcher.rs           # 案例匹配
│   ├── learning/                # 自迭代引擎
│   │   ├── mod.rs
│   │   ├── analyzer.rs          # 数据分析
│   │   ├── suggester.rs         # 生成建议
│   │   └── reviewer.rs          # 审核工作流
│   └── api/                     # 对外接口
│       ├── mod.rs
│       └── service.rs           # 服务层
└── migrations/
    └── knowledge_001.sql        # 数据库迁移
```

## 核心实体设计

### 1. 知识卡片（Knowledge Card）

```rust
pub struct KnowledgeCard {
    pub card_id: String,           // 唯一标识
    pub version: String,           // 语义化版本
    pub category: CardCategory,    // 类型分类
    
    // 元数据
    pub title: String,
    pub description: String,
    pub tags: Vec<String>,
    pub created_by: Creator,       // Human | AI | Hybrid
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub review_status: ReviewStatus, // Draft | Pending | Approved | Deprecated
    
    // 内容（根据类型不同）
    pub content: CardContent,
    
    // 使用统计
    pub usage_stats: CardUsageStats,
}

pub enum CardCategory {
    Constraint,        // 约束卡片（原 system_constraints）
    Guidance,          // 指导卡片（原 retrieval）
    Validation,        // 校验卡片（原 validation）
    Troubleshooting,   // 故障排查
    Pattern,          // 模式识别
}

pub enum CardContent {
    Constraint(ConstraintContent),
    Guidance(GuidanceContent),
    Validation(ValidationContent),
    Troubleshooting(TroubleshootingContent),
    Pattern(PatternContent),
}

// 约束卡片内容
pub struct ConstraintContent {
    pub priority: Priority,
    pub rules: Vec<String>,
    pub output_schema: Option<JsonSchema>,
    pub examples: Vec<Example>,
}

// 指导卡片内容
pub struct GuidanceContent {
    pub trigger_conditions: Vec<String>,      // 何时激活
    pub context_description: String,          // 语义描述
    pub guidance_text: String,               // 指导内容
    pub related_cards: Vec<String>,
}

// 校验卡片内容
pub struct ValidationContent {
    pub validation_rules: Vec<ValidationRule>,
    pub error_messages: HashMap<String, String>,
    pub auto_fix_suggestions: Vec<AutoFix>,
}
```

### 2. 执行案例（Execution Case）

```rust
pub struct ExecutionCase {
    pub case_id: String,
    pub case_type: CaseType,       // Success | Failure | Partial
    
    // 来源
    pub task_id: String,
    pub playbook_version_id: String,
    pub workspace_id: String,
    pub created_at: DateTime,
    
    // 摘要
    pub summary: String,
    pub input_preview: Value,      // 脱敏后的输入
    pub output_preview: Value,     // 脱敏后的输出
    
    // 详细数据（引用 trace）
    pub trace_reference: TraceReference,
    
    // 归因信息
    pub attribution: Option<FailureAttribution>,
    
    // 案例标签
    pub tags: Vec<String>,
    pub patterns: Vec<String>,     // 提取的模式
    
    // 学习价值
    pub learning_value: LearningValue, // High | Medium | Low
    pub reviewed: bool,
    pub reviewer_notes: Option<String>,
}

pub enum CaseType {
    Success,           // 完全成功
    Failure,          // 完全失败
    PartialSuccess,   // 部分成功
    Recovery,         // 失败后恢复
}
```

### 3. 业务规则（Business Rule）

```rust
pub struct BusinessRule {
    pub rule_id: String,
    pub rule_type: RuleType,
    
    pub name: String,
    pub description: String,
    
    // 规则条件
    pub condition: RuleCondition,
    
    // 规则动作
    pub action: RuleAction,
    
    // 元数据
    pub priority: i32,
    pub enabled: bool,
    pub effective_date: DateTime,
    pub expiry_date: Option<DateTime>,
}

pub enum RuleType {
    CapabilityGate,    // 能力准入
    ResourceLimit,     // 资源限制
    Compliance,        // 合规检查
    QualityGate,       // 质量门槛
    ApprovalFlow,      // 审批流程
}
```

### 4. 最佳实践（Best Practice）

```rust
pub struct BestPractice {
    pub practice_id: String,
    
    pub title: String,
    pub description: String,
    pub category: String,
    
    // 适用场景
    pub applicable_contexts: Vec<ContextPattern>,
    
    // 具体做法
    pub steps: Vec<PracticeStep>,
    
    // 成功案例
    pub example_cases: Vec<String>, // case_ids
    
    // 验证指标
    pub success_metrics: Vec<SuccessMetric>,
    
    // 统计数据
    pub adoption_rate: f64,
    pub avg_improvement: f64, // 成功率提升百分比
}
```

## 存储设计

```sql
-- 知识卡片
CREATE TABLE knowledge_cards (
    card_id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_json TEXT NOT NULL,
    tags_json TEXT,
    created_by TEXT,
    review_status TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    success_rate REAL
);

-- 卡片版本历史
CREATE TABLE card_versions (
    card_id TEXT,
    version TEXT,
    content_json TEXT,
    change_summary TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (card_id, version)
);

-- 执行案例
CREATE TABLE execution_cases (
    case_id TEXT PRIMARY KEY,
    case_type TEXT NOT NULL,
    task_id TEXT,
    playbook_version_id TEXT,
    workspace_id TEXT,
    summary TEXT,
    input_preview TEXT,
    output_preview TEXT,
    trace_reference TEXT,
    attribution_json TEXT,
    tags_json TEXT,
    patterns_json TEXT,
    learning_value TEXT,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewer_notes TEXT,
    created_at TIMESTAMP
);

-- 语义索引（用于 RAG）
CREATE TABLE semantic_index (
    entity_id TEXT,
    entity_type TEXT, -- card | case | rule | practice
    embedding BLOB,   -- 向量嵌入
    text_content TEXT,
    updated_at TIMESTAMP,
    PRIMARY KEY (entity_id, entity_type)
);

-- 业务规则
CREATE TABLE business_rules (
    rule_id TEXT PRIMARY KEY,
    rule_type TEXT,
    name TEXT,
    description TEXT,
    condition_json TEXT,
    action_json TEXT,
    priority INTEGER,
    enabled BOOLEAN,
    effective_date TIMESTAMP,
    expiry_date TIMESTAMP
);

-- 最佳实践
CREATE TABLE best_practices (
    practice_id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    applicable_contexts_json TEXT,
    steps_json TEXT,
    example_cases_json TEXT,
    success_metrics_json TEXT,
    adoption_rate REAL,
    avg_improvement REAL
);

-- 学习建议（AI 生成，待审核）
CREATE TABLE learning_suggestions (
    suggestion_id TEXT PRIMARY KEY,
    suggestion_type TEXT, -- new_card | update_card | new_rule | etc
    source_cases TEXT,    -- JSON array of case_ids
    generated_content TEXT,
    confidence_score REAL,
    status TEXT,          -- Pending | Approved | Rejected
    reviewer_notes TEXT,
    created_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by TEXT
);

-- 索引
CREATE INDEX idx_cards_category ON knowledge_cards(category);
CREATE INDEX idx_cards_status ON knowledge_cards(review_status);
CREATE INDEX idx_cards_tags ON knowledge_cards(tags_json);
CREATE INDEX idx_cases_type ON execution_cases(case_type);
CREATE INDEX idx_cases_patterns ON execution_cases(patterns_json);
CREATE INDEX idx_suggestions_status ON learning_suggestions(status);
```

## 自迭代引擎（半自动）

### 数据流

```
Phase 1 Trace Data
        ↓
AttributionEngine 归因分析
        ↓
[失败案例] ───────────────┐
        ↓                  │
CaseAnalyzer 分析模式      │
        ↓                  │
PatternExtractor 提取规律  │
        ↓                  │
KnowledgeSuggester 生成建议│
        ↓                  │
HumanReviewerQueue 人工审核│ ← 关键：人工决策
        ↓                  │
Approved → 更新知识库      │
        ↓                  │
Playbook 引用新知识 ───────┘ (反馈循环)
```

### 核心组件

**1. CaseAnalyzer**
```rust
pub struct CaseAnalyzer;

impl CaseAnalyzer {
    /// 分析失败案例，识别共同模式
    pub fn analyze_failure_patterns(
        &self,
        cases: &[ExecutionCase]
    ) -> Vec<FailurePattern> {
        // 聚类分析
        // 识别高频失败类型
        // 提取上下文特征
    }
    
    /// 对比成功和失败案例
    pub fn compare_success_failure(
        &self,
        success_cases: &[ExecutionCase],
        failure_cases: &[ExecutionCase]
    ) -> Vec<SuccessFactor> {
        // 找出成功的关键因素
    }
}
```

**2. KnowledgeSuggester**
```rust
pub struct KnowledgeSuggester;

impl KnowledgeSuggester {
    /// 基于模式建议新卡片
    pub fn suggest_new_card(
        &self,
        pattern: &FailurePattern
    ) -> KnowledgeCardSuggestion {
        // AI 生成卡片草案
        // 包含约束、指导、校验规则
        // 附带置信度分数
    }
    
    /// 建议更新现有卡片
    pub fn suggest_card_update(
        &self,
        card: &KnowledgeCard,
        cases: &[ExecutionCase]
    ) -> CardUpdateSuggestion {
        // 分析卡片哪里不足
        // 建议补充或修改
    }
    
    /// 生成学习报告
    pub fn generate_learning_report(
        &self,
        time_range: DateRange
    ) -> LearningReport {
        // 这段时间学到了什么
        // 哪些 Playbook 需要更新
        // 知识缺口分析
    }
}
```

**3. HumanReviewer**
```rust
pub struct HumanReviewer;

impl HumanReviewer {
    /// 提交审核队列
    pub fn submit_for_review(
        &self,
        suggestion: LearningSuggestion
    ) -> SuggestionId;
    
    /// 获取待审核列表
    pub fn get_pending_reviews(
        &self,
        reviewer: &User
    ) -> Vec<LearningSuggestion>;
    
    /// 批准建议
    pub fn approve(
        &self,
        suggestion_id: SuggestionId,
        notes: Option<String>
    ) -> Result<KnowledgeCard, Error>;
    
    /// 拒绝建议
    pub fn reject(
        &self,
        suggestion_id: SuggestionId,
        reason: String
    ) -> Result<(), Error>;
    
    /// 请求修改
    pub fn request_changes(
        &self,
        suggestion_id: SuggestionId,
        feedback: String
    ) -> Result<(), Error>;
}
```

## 对外接口

### 服务层 API

```rust
pub trait KnowledgeService {
    // 卡片管理
    async fn create_card(&self, draft: CardDraft) -> Result<KnowledgeCard, Error>;
    async fn get_card(&self, card_id: &str) -> Result<Option<KnowledgeCard>, Error>;
    async fn update_card(&self, card_id: &str, update: CardUpdate) -> Result<KnowledgeCard, Error>;
    async fn list_cards(&self, query: CardQuery) -> Result<Vec<KnowledgeCard>, Error>;
    
    // 语义检索（RAG）
    async fn search_knowledge(
        &self,
        query: &str,
        context: &ExecutionContext,
        limit: usize
    ) -> Result<Vec<RetrievalResult>, Error>;
    
    // 案例管理
    async fn record_case(&self, case: ExecutionCase) -> Result<(), Error>;
    async fn find_similar_cases(
        &self,
        context: &ExecutionContext,
        case_type: CaseType
    ) -> Result<Vec<ExecutionCase>, Error>;
    
    // 规则检查
    async fn check_rules(
        &self,
        context: &ExecutionContext
    ) -> Result<Vec<RuleCheckResult>, Error>;
    
    // 学习建议
    async fn get_pending_suggestions(&self) -> Result<Vec<LearningSuggestion>, Error>;
    async fn review_suggestion(
        &self,
        suggestion_id: &str,
        decision: ReviewDecision
    ) -> Result<(), Error>;
    
    // 统计报告
    async fn generate_report(&self, params: ReportParams) -> Result<KnowledgeReport, Error>;
}
```

### 与 Playbook 集成

```rust
// Playbook 引用知识（替代原来的 knowledge_card_refs）
pub struct PlaybookKnowledgeRefs {
    pub card_refs: Vec<CardRef>,
    pub case_refs: Vec<CaseRef>,
    pub rule_refs: Vec<RuleRef>,
}

pub struct CardRef {
    pub card_id: String,
    pub version: String,        // 版本锁定
    pub binding: CardBinding,   // System | RAG | Validation
    pub trigger: Option<String>, // 触发条件
    pub required: bool,
}

// 在 PlaybookVersion 中
pub struct PlaybookVersion {
    // ... 其他字段
    pub knowledge_refs: PlaybookKnowledgeRefs,
    pub knowledge_index: KnowledgeRetrievalIndex, // 预编译
}
```

### 与 AttributionEngine 集成

```rust
// 归因时查询知识库
impl AttributionEngine {
    pub async fn analyze_with_knowledge(
        &self,
        failure: &FailureCategory,
        knowledge_service: &dyn KnowledgeService
    ) -> EnrichedAttribution {
        // 1. 基础归因
        let base = self.analyze(failure);
        
        // 2. 查询相关知识
        let related_knowledge = knowledge_service
            .search_knowledge(&failure.to_string(), context, 5)
            .await;
        
        // 3. 推荐知识卡片
        let suggested_cards = related_knowledge
            .into_iter()
            .filter(|k| k.relevance > 0.8)
            .map(|k| k.card_id)
            .collect();
        
        EnrichedAttribution {
            base,
            suggested_cards,
            similar_cases: vec![], // 可添加
            recommended_rules: vec![], // 可添加
        }
    }
}
```

## 使用场景

### 场景 1：Playbook 执行

```
1. 任务启动
   ↓
2. 从 PlaybookVersion.knowledge_refs 加载知识
   - System 卡片 → 注入 Prompt
   - RAG 卡片 → 准备检索索引
   - Validation 卡片 → 准备校验规则
   ↓
3. 每步执行
   - 评估 RAG 触发条件
   - 激活相关卡片
   - 记录到 Trace
   ↓
4. 失败时
   - AttributionEngine 分析
   - 查询知识库获取建议
   - 生成归因报告
```

### 场景 2：知识学习

```
1. 定期（每天/每周）运行 CaseAnalyzer
   ↓
2. 识别新的失败模式
   ↓
3. KnowledgeSuggester 生成卡片草案
   ↓
4. 提交到 HumanReviewerQueue
   ↓
5. 专家审核
   - 批准 → 发布新卡片
   - 拒绝 → 记录原因，改进算法
   - 修改 → 更新后发布
   ↓
6. 通知相关 Playbook 作者有新知识可用
```

### 场景 3：Agent 自助学习

```
Agent 遇到问题
    ↓
搜索知识库
    ↓
找到相关卡片
    ↓
应用知识解决问题
    ↓
记录成功案例
    ↓
强化该知识的价值
```

## 实施计划

### Week 1: 基础架构
- 创建 decacan-knowledge crate
- 定义核心实体（Card, Case, Rule, Practice）
- 实现存储层（SQLite + 迁移）
- 基础 CRUD API

### Week 2: 检索引擎
- 语义索引（嵌入向量）
- RAG 检索实现
- 案例匹配算法
- 与 Playbook 集成

### Week 3: 学习引擎（MVP）
- CaseAnalyzer 基础实现
- KnowledgeSuggester 基础实现
- 人工审核工作流
- 生成学习建议

### Week 4: 集成与测试
- 与 AttributionEngine 集成
- 与现有 Trace 系统集成
- 端到端测试
- 性能优化

## 与现有系统的关系

```
Phase 1 (已完成)
├── Trace System ← 数据来源
├── AttributionEngine ← 分析输入
└── 现有 Playbook 系统 ← 使用方

Phase 2 (本设计)
└── Knowledge Learning System (新 crate)
    ├── 知识管理（卡片、案例、规则）
    ├── 检索引擎（语义搜索）
    ├── 学习引擎（AI 建议 + 人工审核）
    └── 服务层（对外 API）

依赖关系：
decacan-knowledge 依赖 decacan-runtime (使用 trace 数据)
decacan-runtime 依赖 decacan-knowledge (查询知识)
decacan-app 依赖两者
```

## 成功标准

- [ ] 可以创建和管理知识卡片
- [ ] Playbook 可以引用知识卡片
- [ ] 执行时可以检索相关知识
- [ ] 可以从失败案例生成学习建议
- [ ] 人工审核工作流可用
- [ ] 知识使用后成功率提升可度量

## 与 Phase 1 的关系

本设计**替代**了原 Phase 2 规划中的知识卡片部分。原设计中卡片是 Playbook 的一部分，现在改为独立的知识学习系统。

**迁移路径：**
1. 保持 Phase 1 的 `relevant_card_refs: Vec<String>`（只存 ID）
2. Phase 2 实现完整的知识学习系统
3. 通过 ID 关联，实现松耦合

---

**Design Author:** AI Assistant
**Date:** 2026-03-30
**Status:** Draft - Pending Approval
