use crate::trace::entities::*;

pub struct AttributionEngine;

impl AttributionEngine {
    pub fn analyze(failure: &FailureCategory) -> FailureAttribution {
        match failure {
            FailureCategory::Runtime(err) => Self::analyze_runtime_error(err),
            FailureCategory::Contract(violation) => Self::analyze_contract_violation(violation),
            FailureCategory::Quality(issue) => Self::analyze_quality_issue(issue),
            FailureCategory::Policy(violation) => Self::analyze_policy_violation(violation),
            FailureCategory::PartialCompletion(partial) => {
                Self::analyze_partial_completion(partial)
            }
        }
    }

    pub fn analyze_runtime_error(error: &RuntimeError) -> FailureAttribution {
        let attribution = match error.error_type.as_str() {
            "CapabilityNotFound" => AttributionTarget::DraftCapabilityRef {
                ref_name: error.capability_ref.clone().unwrap_or_default(),
                location: format!("capability_refs"),
            },
            "CapabilityExecutionError" => AttributionTarget::DraftWorkflowStep {
                step_index: 0,
                field: "routine".to_string(),
            },
            "Timeout" => AttributionTarget::DraftPolicyProfile {
                policy_name: "timeout".to_string(),
            },
            "ResourceExceeded" => AttributionTarget::DraftPolicyProfile {
                policy_name: "resource_limits".to_string(),
            },
            _ => AttributionTarget::RuntimeEnvironment,
        };

        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: "".to_string(),
            failure_category: FailureCategory::Runtime(error.clone()),
            attribution,
            root_cause: error.message.clone(),
            suggested_fix: Self::suggest_fix_for_runtime_error(error),
            relevant_card_refs: vec![],
        }
    }

    fn suggest_fix_for_runtime_error(error: &RuntimeError) -> String {
        match error.error_type.as_str() {
            "CapabilityNotFound" => format!(
                "1. 检查 capability_ref '{}' 拼写是否正确\n\
                 2. 确认该 capability 已在系统中注册\n\
                 3. 或更换为其他 capability",
                error.capability_ref.as_deref().unwrap_or("unknown")
            ),
            "Timeout" => "建议：\n1. 增加 execution_profile.timeout_seconds\n2. 优化 workflow 减少处理量\n3. 或添加分批处理逻辑".to_string(),
            _ => "请查看错误详情并调整相关配置".to_string(),
        }
    }

    pub fn analyze_contract_violation(violation: &ContractViolation) -> FailureAttribution {
        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: "".to_string(),
            failure_category: FailureCategory::Contract(violation.clone()),
            attribution: AttributionTarget::DraftOutputContract {
                contract_type: violation.field.clone(),
            },
            root_cause: format!("输出字段 '{}' 不符合契约", violation.field),
            suggested_fix: format!(
                "字段 '{}' 期望 '{}'，实际得到 '{}'\n\
                 建议检查 output_contract 定义或调整生成逻辑",
                violation.field, violation.expected, violation.actual
            ),
            relevant_card_refs: vec!["card-output-contract".to_string()],
        }
    }

    pub fn analyze_quality_issue(issue: &QualityIssue) -> FailureAttribution {
        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: "".to_string(),
            failure_category: FailureCategory::Quality(issue.clone()),
            attribution: AttributionTarget::KnowledgeCard {
                card_id: format!("card-quality-{}", issue.dimension),
                dimension: issue.dimension.clone(),
            },
            root_cause: format!(
                "质量维度 '{}' 得分 {} 低于阈值 {}",
                issue.dimension, issue.score, issue.threshold
            ),
            suggested_fix: format!(
                "质量维度 '{}' 不达标\n\
                 建议：\n\
                 1. 检查相关知识卡片 'card-quality-{}'\n\
                 2. 增加该维度的约束\n\
                 3. 考虑增加预处理步骤提升输入质量",
                issue.dimension, issue.dimension
            ),
            relevant_card_refs: vec![format!("card-quality-{}", issue.dimension)],
        }
    }

    pub fn analyze_policy_violation(violation: &PolicyViolation) -> FailureAttribution {
        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: "".to_string(),
            failure_category: FailureCategory::Policy(violation.clone()),
            attribution: AttributionTarget::DraftPolicyProfile {
                policy_name: violation.policy_type.clone(),
            },
            root_cause: format!("违反策略: {}", violation.policy_type),
            suggested_fix: format!(
                "策略 '{}' 被违反: {}\n\
                 建议：\n\
                 1. 调整 policy_profile 放宽限制\n\
                 2. 或修改执行逻辑避免触发该策略",
                violation.policy_type, violation.violation_detail
            ),
            relevant_card_refs: vec![],
        }
    }

    pub fn analyze_partial_completion(partial: &PartialFailure) -> FailureAttribution {
        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: partial.failed_step.clone(),
            failure_category: FailureCategory::PartialCompletion(partial.clone()),
            attribution: AttributionTarget::DraftWorkflowStep {
                step_index: 0,
                field: "error_handling".to_string(),
            },
            root_cause: format!(
                "部分完成: 已完成 {} 个步骤，在 '{}' 失败",
                partial.completed_steps.len(),
                partial.failed_step
            ),
            suggested_fix: format!(
                "部分数据成功，部分失败\n\
                 建议：\n\
                 1. 增加分批处理逻辑\n\
                 2. 增加错误恢复机制（如跳过失败项继续）\n\
                 3. 或降低单批次数据量",
            ),
            relevant_card_refs: vec!["card-batch-processing".to_string()],
        }
    }
}
