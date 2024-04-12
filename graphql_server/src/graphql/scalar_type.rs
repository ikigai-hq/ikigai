use async_graphql::*;

use crate::graphql::validator::check_email;

#[derive(Debug, Clone)]
pub enum OpenExamIdentity {
    Email(String),
}

#[Scalar]
impl ScalarType for OpenExamIdentity {
    fn parse(value: Value) -> InputValueResult<Self> {
        if let Value::String(value_str) = &value {
            let value_str = value_str.to_lowercase();
            if check_email(&value_str).is_ok() {
                return Ok(Self::Email(value_str));
            }
        }

        // If the type does not match
        Err(InputValueError::expected_type(value))
    }

    fn to_value(&self) -> Value {
        Value::String(
            match self {
                OpenExamIdentity::Email(email) => email,
            }
            .to_string(),
        )
    }
}

impl OpenExamIdentity {
    pub fn email(&self) -> Option<&String> {
        match self {
            OpenExamIdentity::Email(email) => Some(email),
        }
    }
}
