use decacan_runtime::playbook::spec::{
    entities::*,
    parser::{PlaybookSpecParser, SpecParseError},
};

const SUMMARY_PLAYBOOK_YAML: &str = r#"
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
    required: false
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
        type: next
        step_id: read
    
    - id: read
      name: 读取内容
      routine:
        class: builtin
        name: read_file_content
      transition:
        type: next
        step_id: analyze
    
    - id: analyze
      name: 分析主题
      routine:
        class: builtin
        name: extract_topics
      transition:
        type: conditional
        branches:
          - condition: "output.topics.length > 0"
            step_id: generate
          - condition: "output.topics.length == 0"
            step_id: skip_empty
    
    - id: skip_empty
      name: 跳过空内容
      routine:
        class: builtin
        name: noop
      transition:
        type: end
    
    - id: generate
      name: 生成摘要
      routine:
        class: builtin
        name: generate_summary
      transition:
        type: next
        step_id: write
    
    - id: write
      name: 写入输出
      routine:
        class: builtin
        name: write_output
      transition:
        type: next
        step_id: register
    
    - id: register
      name: 注册产物
      routine:
        class: builtin
        name: register_artifact
      transition:
        type: end

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
"#;

#[test]
fn test_parse_summary_spec() {
    let spec = PlaybookSpecParser::parse(SUMMARY_PLAYBOOK_YAML).unwrap();

    assert_eq!(spec.metadata.title, "总结资料");
    assert_eq!(spec.metadata.description, "扫描 markdown 文件并生成摘要");
    assert_eq!(spec.metadata.mode, PlaybookMode::Standard);
    assert_eq!(spec.metadata.version, "1.0.0");
    assert_eq!(spec.metadata.tags, vec!["文档处理", "摘要生成"]);

    assert_eq!(spec.workflow.steps.len(), 7);

    // Check first step
    let first_step = &spec.workflow.steps[0];
    assert_eq!(first_step.id, "scan");
    assert_eq!(first_step.name, "扫描文件");
    assert_eq!(first_step.routine.capability_class, "builtin");
    assert_eq!(first_step.routine.name, "scan_markdown_files");

    // Check transition types
    match &spec.workflow.steps[0].transition {
        Transition::Next { step_id } => assert_eq!(step_id, "read"),
        _ => panic!("Expected Next transition"),
    }

    match &spec.workflow.steps[2].transition {
        Transition::Conditional { branches } => {
            assert_eq!(branches.len(), 2);
            assert_eq!(branches[0].condition, "output.topics.length > 0");
            assert_eq!(branches[0].step_id, "generate");
        }
        _ => panic!("Expected Conditional transition"),
    }

    // Check output contract
    assert_eq!(
        spec.output_contract
            .primary_artifact
            .as_ref()
            .unwrap()
            .artifact_type,
        "markdown_document"
    );
}

#[test]
fn test_invalid_transition() {
    let yaml = r#"
metadata:
  title: "Test"
  description: "Test playbook"
  mode: standard
  version: "1.0.0"
  tags: []

input_schema: []

workflow:
  steps:
    - id: step1
      name: "Step 1"
      description: "First step"
      routine:
        class: builtin
        name: test
      transition:
        type: next
        step_id: non_existent

capability_refs:
  routines: []
  tools: []

output_contract:
  backup_policy: none
"#;

    let result = PlaybookSpecParser::parse(yaml);
    assert!(matches!(
        result,
        Err(SpecParseError::InvalidTransition { .. })
    ));
}

#[test]
fn test_duplicate_step_ids() {
    let yaml = r#"
metadata:
  title: "Test"
  description: "Test playbook"
  mode: standard
  version: "1.0.0"
  tags: []

input_schema: []

workflow:
  steps:
    - id: step1
      name: "Step 1"
      description: "First step"
      routine:
        class: builtin
        name: test1
      transition:
        type: end
    
    - id: step1
      name: "Step 1 Again"
      description: "Duplicate step"
      routine:
        class: builtin
        name: test2
      transition:
        type: end

capability_refs:
  routines: []
  tools: []

output_contract:
  backup_policy: none
"#;

    let result = PlaybookSpecParser::parse(yaml);
    assert!(matches!(result, Err(SpecParseError::DuplicateStepIds)));
}

#[test]
fn test_minimal_valid_spec() {
    let yaml = r#"
metadata:
  title: "Minimal"
  description: "Minimal playbook"
  mode: autonomous
  version: "1.0.0"
  tags: []

input_schema: []

workflow:
  steps:
    - id: start
      name: "Start"
      description: "Start step"
      routine:
        class: builtin
        name: noop
      transition:
        type: end

capability_refs:
  routines: []
  tools: []

output_contract:
  backup_policy: none
"#;

    let result = PlaybookSpecParser::parse(yaml);
    assert!(result.is_ok());
}

#[test]
fn test_input_schema_parsing() {
    let yaml = r#"
metadata:
  title: "Test"
  description: "Test playbook"
  mode: standard
  version: "1.0.0"
  tags: []

input_schema:
  - name: source_directory
    type: path
    required: true
    description: "Source directory"
  - name: output_format
    type: enum
    required: false
    options: [markdown, json]
    default: markdown

workflow:
  steps:
    - id: start
      name: "Start"
      description: "Start step"
      routine:
        class: builtin
        name: noop
      transition:
        type: end

capability_refs:
  routines: []
  tools: []

output_contract:
  backup_policy: none
"#;

    let spec = PlaybookSpecParser::parse(yaml).unwrap();
    assert_eq!(spec.input_schema.len(), 2);

    let first_field = &spec.input_schema[0];
    assert_eq!(first_field.name, "source_directory");
    assert_eq!(first_field.field_type, InputFieldType::Path);
    assert_eq!(first_field.required, true);

    let second_field = &spec.input_schema[1];
    assert_eq!(second_field.field_type, InputFieldType::Enum);
    assert_eq!(
        second_field.options.as_ref().unwrap(),
        &vec!["markdown".to_string(), "json".to_string()]
    );
    assert_eq!(second_field.default.as_ref().unwrap(), "markdown");
}

#[test]
fn test_capability_refs_parsing() {
    let yaml = r#"
metadata:
  title: "Test"
  description: "Test playbook"
  mode: standard
  version: "1.0.0"
  tags: []

input_schema: []

workflow:
  steps:
    - id: start
      name: "Start"
      description: "Start step"
      routine:
        class: builtin
        name: noop
      transition:
        type: end

capability_refs:
  routines:
    - builtin.scan_markdown_files
    - builtin.read_file_content
  tools:
    - builtin.workspace.read
    - builtin.workspace.write

output_contract:
  backup_policy: none
"#;

    let spec = PlaybookSpecParser::parse(yaml).unwrap();
    assert_eq!(
        spec.capability_refs.routines,
        vec!["builtin.scan_markdown_files", "builtin.read_file_content"]
    );
    assert_eq!(
        spec.capability_refs.tools,
        vec!["builtin.workspace.read", "builtin.workspace.write"]
    );
}
