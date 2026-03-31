use serde_json::Value;

use crate::routine::contract::{Contract, ContractType, ValidationError};

/// Validation mode for contract checking
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ValidationMode {
    /// Strict mode: all validations must pass
    Strict,
    /// Lenient mode: allow extra fields, type coercion
    Lenient,
}

/// Validator for runtime contract validation with configurable modes
pub struct ContractValidator {
    mode: ValidationMode,
}

impl ContractValidator {
    /// Create a new validator with the given mode
    pub fn new(mode: ValidationMode) -> Self {
        Self { mode }
    }

    /// Create a strict validator
    pub fn strict() -> Self {
        Self::new(ValidationMode::Strict)
    }

    /// Create a lenient validator
    pub fn lenient() -> Self {
        Self::new(ValidationMode::Lenient)
    }

    /// Validate input against a contract
    pub fn validate_input(
        &self,
        contract: &Contract,
        value: &Value,
    ) -> Result<(), Vec<ValidationError>> {
        match self.mode {
            ValidationMode::Strict => self.validate_strict(contract, value, ""),
            ValidationMode::Lenient => self.validate_lenient(contract, value, ""),
        }
    }

    /// Validate output against a contract
    pub fn validate_output(
        &self,
        contract: &Contract,
        value: &Value,
    ) -> Result<(), Vec<ValidationError>> {
        // Output validation is always strict in production
        self.validate_strict(contract, value, "")
    }

    /// Strict validation - all rules enforced
    fn validate_strict(
        &self,
        contract: &Contract,
        value: &Value,
        path: &str,
    ) -> Result<(), Vec<ValidationError>> {
        let mut errors = Vec::new();
        self.validate_value(contract, value, path, &mut errors, true);

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Lenient validation - allow extra fields and type coercion
    fn validate_lenient(
        &self,
        contract: &Contract,
        value: &Value,
        path: &str,
    ) -> Result<(), Vec<ValidationError>> {
        let mut errors = Vec::new();
        self.validate_value(contract, value, path, &mut errors, false);

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Core validation logic
    fn validate_value(
        &self,
        contract: &Contract,
        value: &Value,
        path: &str,
        errors: &mut Vec<ValidationError>,
        strict: bool,
    ) {
        // Null values are valid for any type (unless required)
        if value.is_null() {
            return;
        }

        match contract.contract_type {
            ContractType::Object => self.validate_object(contract, value, path, errors, strict),
            ContractType::Array => self.validate_array(contract, value, path, errors, strict),
            ContractType::String => self.validate_string(value, path, errors),
            ContractType::Number => self.validate_number(value, path, errors),
            ContractType::Integer => self.validate_integer(value, path, errors),
            ContractType::Boolean => self.validate_boolean(value, path, errors),
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

    fn validate_object(
        &self,
        contract: &Contract,
        value: &Value,
        path: &str,
        errors: &mut Vec<ValidationError>,
        strict: bool,
    ) {
        let Some(obj) = value.as_object() else {
            errors.push(ValidationError {
                path: path.to_string(),
                message: "expected object".to_string(),
            });
            return;
        };

        // Check required fields
        for field in &contract.required {
            if !obj.contains_key(field) {
                errors.push(ValidationError {
                    path: format!("{}{}", path, field),
                    message: format!("missing required field '{}'", field),
                });
            }
        }

        // Validate properties
        if let Some(properties) = &contract.properties {
            for (key, val) in obj {
                let field_path = if path.is_empty() {
                    key.clone()
                } else {
                    format!("{}.{}", path, key)
                };

                if let Some(prop_contract) = properties.get(key) {
                    self.validate_value(prop_contract, val, &field_path, errors, strict);
                } else if strict {
                    // In strict mode, extra fields are errors
                    errors.push(ValidationError {
                        path: field_path,
                        message: format!("unknown field '{}'", key),
                    });
                }
                // In lenient mode, extra fields are allowed
            }
        }
    }

    fn validate_array(
        &self,
        contract: &Contract,
        value: &Value,
        path: &str,
        errors: &mut Vec<ValidationError>,
        strict: bool,
    ) {
        let Some(arr) = value.as_array() else {
            errors.push(ValidationError {
                path: path.to_string(),
                message: "expected array".to_string(),
            });
            return;
        };

        if let Some(item_contract) = &contract.items {
            for (i, item) in arr.iter().enumerate() {
                let item_path = format!("{}[{}]", path, i);
                self.validate_value(item_contract, item, &item_path, errors, strict);
            }
        }
    }

    fn validate_string(&self, value: &Value, path: &str, errors: &mut Vec<ValidationError>) {
        if !value.is_string() {
            errors.push(ValidationError {
                path: path.to_string(),
                message: "expected string".to_string(),
            });
        }
    }

    fn validate_number(&self, value: &Value, path: &str, errors: &mut Vec<ValidationError>) {
        if !value.is_number() {
            errors.push(ValidationError {
                path: path.to_string(),
                message: "expected number".to_string(),
            });
        }
    }

    fn validate_integer(&self, value: &Value, path: &str, errors: &mut Vec<ValidationError>) {
        // Check if it's an integer (not a float with decimal)
        if let Some(n) = value.as_f64() {
            if n.fract() != 0.0 {
                errors.push(ValidationError {
                    path: path.to_string(),
                    message: "expected integer, got float".to_string(),
                });
            }
        } else if !value.is_i64() && !value.is_u64() {
            errors.push(ValidationError {
                path: path.to_string(),
                message: "expected integer".to_string(),
            });
        }
    }

    fn validate_boolean(&self, value: &Value, path: &str, errors: &mut Vec<ValidationError>) {
        if !value.is_boolean() {
            errors.push(ValidationError {
                path: path.to_string(),
                message: "expected boolean".to_string(),
            });
        }
    }
}

impl Default for ContractValidator {
    fn default() -> Self {
        Self::strict()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::routine::contract::ContractBuilder;

    #[test]
    fn test_strict_validation_rejects_extra_fields() {
        let contract = Contract::object().field("name", Contract::string()).build();

        let value = serde_json::json!({
            "name": "Alice",
            "extra": "field"
        });

        let validator = ContractValidator::strict();
        let result = validator.validate_input(&contract, &value);

        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| e.path == "extra"));
    }

    #[test]
    fn test_lenient_validation_allows_extra_fields() {
        let contract = Contract::object().field("name", Contract::string()).build();

        let value = serde_json::json!({
            "name": "Alice",
            "extra": "field"
        });

        let validator = ContractValidator::lenient();
        let result = validator.validate_input(&contract, &value);

        assert!(result.is_ok());
    }

    #[test]
    fn test_validation_missing_required_field() {
        let contract = Contract::object()
            .field("name", Contract::string())
            .field("age", Contract::integer())
            .build();

        let value = serde_json::json!({
            "name": "Alice"
        });

        let validator = ContractValidator::strict();
        let result = validator.validate_input(&contract, &value);

        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| e.path == "age"));
    }

    #[test]
    fn test_validation_type_mismatch() {
        let contract = Contract::object()
            .field("count", Contract::integer())
            .build();

        let value = serde_json::json!({
            "count": "not a number"
        });

        let validator = ContractValidator::strict();
        let result = validator.validate_input(&contract, &value);

        assert!(result.is_err());
    }

    #[test]
    fn test_validation_nested_object() {
        let contract = Contract::object()
            .field(
                "user",
                Contract::object()
                    .field("name", Contract::string())
                    .field("age", Contract::integer())
                    .build(),
            )
            .build();

        let value = serde_json::json!({
            "user": {
                "name": "Alice",
                "age": 30
            }
        });

        let validator = ContractValidator::strict();
        let result = validator.validate_input(&contract, &value);

        assert!(result.is_ok());
    }

    #[test]
    fn test_validation_array() {
        let contract = Contract::array(Contract::string()).build();

        let valid = serde_json::json!(["a", "b", "c"]);
        let validator = ContractValidator::strict();
        assert!(validator.validate_input(&contract, &valid).is_ok());

        let invalid = serde_json::json!([1, 2, 3]);
        assert!(validator.validate_input(&contract, &invalid).is_err());
    }

    #[test]
    fn test_validation_integer_vs_float() {
        let contract = Contract::object()
            .field("count", Contract::integer())
            .build();

        let integer = serde_json::json!({ "count": 42 });
        let float = serde_json::json!({ "count": 42.5 });

        let validator = ContractValidator::strict();
        assert!(validator.validate_input(&contract, &integer).is_ok());
        assert!(validator.validate_input(&contract, &float).is_err());
    }
}
