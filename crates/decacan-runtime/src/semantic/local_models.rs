use crate::semantic::model::{ModelContext, OutputCandidate, SemanticModel};

#[derive(Debug, Clone, Copy)]
pub(crate) struct SummarySemanticModel;

impl SemanticModel for SummarySemanticModel {
    type Error = core::convert::Infallible;

    fn produce_output_candidate(
        &self,
        context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error> {
        Ok(OutputCandidate {
            artifact_id: "semantic-output-summary".to_owned(),
            logical_name: "workspace.summary.primary".to_owned(),
            canonical_path: "output/summary.md".to_owned(),
            physical_path: "/tmp/runtime-summary.md".to_owned(),
            content: summarize_source_material(
                &context.source_material,
                context.source_path.as_deref(),
            ),
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub(crate) struct DiscoverySemanticModel;

impl SemanticModel for DiscoverySemanticModel {
    type Error = core::convert::Infallible;

    fn produce_output_candidate(
        &self,
        context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error> {
        Ok(OutputCandidate {
            artifact_id: "semantic-output-discovery".to_owned(),
            logical_name: "workspace.discovery.primary".to_owned(),
            canonical_path: "output/discovery.md".to_owned(),
            physical_path: "/tmp/runtime-discovery.md".to_owned(),
            content: discover_source_themes(
                &context.source_material,
                context.source_path.as_deref(),
            ),
        })
    }
}

fn summarize_source_material(source_material: &str, source_path: Option<&str>) -> String {
    let source_path = source_path.unwrap_or("unknown.md");
    let points = extract_source_points(source_material);
    let overview = points
        .first()
        .cloned()
        .unwrap_or_else(|| "未找到可总结的源内容。".to_owned());
    let grouped_themes = numbered_theme_lines(&points, "未识别到可分组的主题。");
    let key_findings = bullet_lines(&points, "未提取到明确结论。");
    let gaps = if points.is_empty() {
        vec![
            "- 当前源文件没有可提取的正文内容。".to_owned(),
            format!("- 需要补充 `{source_path}` 的有效内容后再生成总结。"),
        ]
    } else {
        vec![
            format!("- 当前总结仅覆盖 `{source_path}` 这一个源文件。"),
            "- 缺少明确的负责人、时间节点或量化结果，需后续确认。".to_owned(),
        ]
    };
    let next_steps = vec![
        format!("- 围绕 `{source_path}` 补充更多上下文材料后重新生成总结。"),
        "- 将关键结论整理为可执行事项并补充负责人、截止时间。".to_owned(),
    ];

    format!(
        "# 总结资料\n\n## 总览\n- 来源文件: `{source_path}`\n- 内容概览: {overview}\n\n## 主题分组\n{}\n\n## 关键结论\n{}\n\n## 信息缺口 / 待确认事项\n{}\n\n## 建议下一步\n{}",
        grouped_themes.join("\n"),
        key_findings.join("\n"),
        gaps.join("\n"),
        next_steps.join("\n")
    )
}

fn discover_source_themes(source_material: &str, source_path: Option<&str>) -> String {
    let source_path = source_path.unwrap_or("unknown.md");
    let points = extract_source_points(source_material);
    let candidate_themes = bullet_lines(&points, "未识别到候选主题。");
    let follow_up = if points.is_empty() {
        vec![
            format!("- 检查 `{source_path}` 是否包含可解析的正文内容。"),
            "- 如果需要主题发现结果，请补充更具体的源材料。".to_owned(),
        ]
    } else {
        vec![
            format!("- 确认 `{source_path}` 中各主题的优先级与负责人。"),
            "- 如需更完整发现结果，补充更多源文档后重新运行。".to_owned(),
        ]
    };

    format!(
        "# 主题发现\n\n## 来源\n- 文件: `{source_path}`\n\n## 候选主题\n{}\n\n## 后续关注\n{}",
        candidate_themes.join("\n"),
        follow_up.join("\n")
    )
}

fn extract_source_points(source_material: &str) -> Vec<String> {
    let mut points = Vec::new();

    for line in source_material.lines() {
        let cleaned = normalize_source_line(line);
        if cleaned.is_empty() || points.contains(&cleaned) {
            continue;
        }
        points.push(cleaned);
    }

    points.into_iter().take(3).collect()
}

fn normalize_source_line(line: &str) -> String {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return String::new();
    }

    trimmed
        .trim_start_matches(|character: char| matches!(character, '#' | '-' | '*' | '>'))
        .trim()
        .to_owned()
}

fn numbered_theme_lines(points: &[String], empty_message: &str) -> Vec<String> {
    if points.is_empty() {
        return vec![format!("- {empty_message}")];
    }

    points
        .iter()
        .enumerate()
        .map(|(index, point)| format!("- 主题 {}: {point}", index + 1))
        .collect()
}

fn bullet_lines(points: &[String], empty_message: &str) -> Vec<String> {
    if points.is_empty() {
        return vec![format!("- {empty_message}")];
    }

    points.iter().map(|point| format!("- {point}")).collect()
}
