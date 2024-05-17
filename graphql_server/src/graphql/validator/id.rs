use async_graphql::{CustomValidator, InputValueError};
use validator::ValidateEmail;

pub struct Email;

impl CustomValidator<String> for Email {
    fn check(&self, s: &String) -> Result<(), InputValueError<String>> {
        check_email(s).map_err(InputValueError::custom)
    }
}

pub fn check_email(s: &String) -> Result<(), String> {
    if !s.validate_email() {
        return Err("Email is not valid".into());
    }

    Ok(())
}
