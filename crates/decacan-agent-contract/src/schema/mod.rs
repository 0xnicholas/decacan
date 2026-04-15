use serde_json::Value;

pub fn execution_event_json_schema() -> Value {
    serde_json::json!({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "ExecutionEvent",
        "description": "See decacan-agent-contract::events::ExecutionEvent for the Rust definition"
    })
}

pub fn execution_request_json_schema() -> Value {
    serde_json::json!({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "ExecutionRequest",
        "description": "See decacan-agent-contract::request::ExecutionRequest for the Rust definition"
    })
}
