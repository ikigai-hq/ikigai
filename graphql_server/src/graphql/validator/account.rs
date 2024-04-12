use async_graphql::CustomValidator;
use validator::{validate_non_control_character, HasLen};

pub struct Username;

impl CustomValidator<String> for Username {
    fn check(&self, s: &String) -> Result<(), String> {
        check_user_name(s)
    }
}

pub fn check_user_name(s: &String) -> Result<(), String> {
    if !validate_non_control_character(s) {
        return Err("Username must not contain special characters".into());
    }

    if &s.to_lowercase() != s {
        return Err("Username must be lowercase".into());
    }

    if s.contains(' ') {
        return Err("Username must not contain space".into());
    }

    if s.length() < 6 || s.length() > 64 {
        return Err("Username length must be from 6 to 64".into());
    }

    Ok(())
}

pub struct Password;

impl CustomValidator<String> for Password {
    fn check(&self, pwd: &String) -> Result<(), String> {
        if pwd.length() < 6 || pwd.length() > 256 {
            return Err("Password length must be from 6 to 256".into());
        }

        Ok(())
    }
}
