use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Contract for validating input/output data
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Contract {
    pub contract_type: ContractType,
    pub required: Vec<String>,
    pub properties: Option<std::collections::HashMap<String, Contract>>,
    pub items: Option<Box<Contract>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ContractType {
    Object,
    Array,
    String,
    Number,
    Integer,
    Boolean,
    Null,
    Any,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationError {
    pub path: String,
    pub message: String,
}

impl Contract {
    /// Create an object contract builder
    pub fn object() -> ContractBuilder {
        ContractBuilder::new(ContractType::Object)
    }

    /// Create an array contract builder
    pub fn array(item_contract: Contract) -> ContractBuilder {
        ContractBuilder::new(ContractType::Array).items(item_contract)
    }

    /// Create a string contract
    pub fn string() -> Self {
        Self {
            contract_type: ContractType::String,
            required: Vec::new(),
            properties: None,
            items: None,
        }
    }

    /// Create a number contract
    pub fn number() -> Self {
        Self {
            contract_type: ContractType::Number,
            required: Vec::new(),
            properties: None,
            items: None,
        }
    }

    /// Create an integer contract
    pub fn integer() -> Self {
        Self {
            contract_type: ContractType::Integer,
            required: Vec::new(),
            properties: None,
            items: None,
        }
    }

    /// Create a boolean contract
    pub fn boolean() -> Self {
        Self {
            contract_type: ContractType::Boolean,
            required: Vec::new(),
            properties: None,
            items: None,
        }
    }

    /// Create a path contract (treated as string)
    pub fn path() -> Self {
        Self::string()
    }

    /// Validate a value against this contract
    pub fn validate(&self, value: &Value) -> Result<(), Vec<ValidationError>> {
        let mut errors = Vec::new();
        self.validate_at_path(value, "", &mut errors);

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    fn validate_at_path(&self, value: &Value, path: &str, errors: &mut Vec<ValidationError>) {
        match self.contract_type {
            ContractType::Object => {
                if let Some(obj) = value.as_object() {
                    // Check required fields
                    for field in &self.required {
                        if !obj.contains_key(field) {
                            errors.push(ValidationError {
                                path: format!("{}{}", path, field),
                                message: format!("missing required field '{}'", field),
                            });
                        }
                    }

                    // Validate properties
                    if let Some(ref properties) = self.properties {
                        for (key, val) in obj {
                            if let Some(contract) = properties.get(key) {
                                let field_path = if path.is_empty() {
                                    format!("{}.", key)
                                } else {
                                    format!("{}{}.", path, key)
                                };
                                contract.validate_at_path(val, &field_path, errors);
                            }
                        }
                    }
                } else {
                    errors.push(ValidationError {
                        path: path.to_string(),
                        message: "expected object".to_string(),
                    });
                }
            }
            ContractType::Array => {
                if let Some(arr) = value.as_array() {
                    if let Some(ref item_contract) = self.items {
                        for (i, item) in arr.iter().enumerate() {
                            let item_path = format!("{}[{}]", path, i);
                            item_contract.validate_at_path(item, &item_path, errors);
                        }
                    }
                } else {
                    errors.push(ValidationError {
                        path: path.to_string(),
                        message: "expected array".to_string(),
                    });
                }
            }
            ContractType::String => {
                if !value.is_string() && !value.is_null() {
                    errors.push(ValidationError {
                        path: path.to_string(),
                        message: "expected string".to_string(),
                    });
                }
            }
            ContractType::Number => {
                if !value.is_number() && !value.is_null() {
                    errors.push(ValidationError {
                        path: path.to_string(),
                        message: "expected number".to_string(),
                    });
                }
            }
            ContractType::Integer => {
                if !value.is_i64() && !value.is_u64() && !value.is_null() {
                    errors.push(ValidationError {
                        path: path.to_string(),
                        message: "expected integer".to_string(),
                    });
                }
            }
            ContractType::Boolean => {
                if !value.is_boolean() && !value.is_null() {
                    errors.push(ValidationError {
                        path: path.to_string(),
                        message: "expected boolean".to_string(),
                    });
                }
            }
            ContractType::Null => {
                if !value.is_null() {
                    errors.push(ValidationError {
                        path: path.to_string(),
                        message: "expected null".to_string(),
                    });
                }
            }
            ContractType::Any => {
                // Any type is valid
            }
        }
    }
}

/// Builder for constructing contracts
pub struct ContractBuilder {
    contract_type: ContractType,
    required: Vec<String>,
    properties: Option<std::collections::HashMap<String, Contract>>,
    items: Option<Box<Contract>>,
}

impl ContractBuilder {
    fn new(contract_type: ContractType) -> Self {
        Self {
            contract_type,
            required: Vec::new(),
            properties: None,
            items: None,
        }
    }

    /// Add a required field to an object contract
    pub fn field(mut self, name: impl Into<String>, contract: Contract) -> Self {
        let name = name.into();
        self.required.push(name.clone());

        let mut properties = self.properties.take().unwrap_or_default();
        properties.insert(name, contract);
        self.properties = Some(properties);

        self
    }

    /// Add an optional field to an object contract
    pub fn optional_field(mut self, name: impl Into<String>, contract: Contract) -> Self {
        let name = name.into();

        let mut properties = self.properties.take().unwrap_or_default();
        properties.insert(name, contract);
        self.properties = Some(properties);

        self
    }

    /// Set the items contract for an array
    pub fn items(mut self, contract: Contract) -> Self {
        self.items = Some(Box::new(contract));
        self
    }

    /// Build the contract
    pub fn build(self) -> Contract {
        Contract {
            contract_type: self.contract_type,
            required: self.required,
            properties: self.properties,
            items: self.items,
        }
    }
}

impl Default for ContractBuilder {
    fn default() -> Self {
        Self::new(ContractType::Object)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_object_contract_validation() {
        let contract = Contract::object()
            .field("name", Contract::string())
            .field("age", Contract::integer())
            .build();

        let valid = json!({"name": "Alice", "age": 30});
        assert!(contract.validate(&valid).is_ok());

        let missing_field = json!({"name": "Bob"});
        let result = contract.validate(&missing_field);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| e.path == "age"));
    }

    #[test]
    fn test_array_contract_validation() {
        let contract = Contract::array(Contract::string()).build();

        let valid = json!(["a", "b", "c"]);
        assert!(contract.validate(&valid).is_ok());

        let invalid = json!([1, 2, 3]);
        assert!(contract.validate(&invalid).is_err());
    }

    #[test]
    fn test_nested_object_contract() {
        let contract = Contract::object()
            .field(
                "user",
                Contract::object().field("name", Contract::string()).build(),
            )
            .build();

        let valid = json!({"user": {"name": "Alice"}});
        assert!(contract.validate(&valid).is_ok());

        let invalid = json!({"user": {"name": 123}});
        assert!(contract.validate(&invalid).is_err());
    }

    #[test]
    fn test_optional_field() {
        let contract = Contract::object()
            .field("required_field", Contract::string())
            .optional_field("optional_field", Contract::string())
            .build();

        let with_optional = json!({"required_field": "test", "optional_field": "extra"});
        assert!(contract.validate(&with_optional).is_ok());

        let without_optional = json!({"required_field": "test"});
        assert!(contract.validate(&without_optional).is_ok());
    }
}
