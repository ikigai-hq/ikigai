use async_graphql::CustomValidator;
use validator::ValidateEmail;

pub struct Email;

impl CustomValidator<String> for Email {
    fn check(&self, s: &String) -> Result<(), String> {
        check_email(s)
    }
}

pub fn check_email(s: &String) -> Result<(), String> {
    if !s.validate_email() {
        return Err("Email is not valid".into());
    }

    Ok(())
}
