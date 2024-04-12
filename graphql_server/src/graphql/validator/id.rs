use async_graphql::CustomValidator;
use validator::{validate_email, validate_non_control_character, validate_phone};

pub struct Email;

impl CustomValidator<String> for Email {
    fn check(&self, s: &String) -> Result<(), String> {
        check_email(s)
    }
}

pub fn check_email(s: &String) -> Result<(), String> {
    if !validate_non_control_character(s) {
        return Err("Email must not include special character".into());
    }

    if !validate_email(s) {
        return Err("Email is not valid".into());
    }

    Ok(())
}

pub struct PhoneNumber;

impl CustomValidator<String> for PhoneNumber {
    fn check(&self, s: &String) -> Result<(), String> {
        if validate_phone(s) {
            return Ok(());
        }

        Err("Incorrect email or phone number".into())
    }
}

pub struct PhoneNumberOrEmail;

impl CustomValidator<String> for PhoneNumberOrEmail {
    fn check(&self, s: &String) -> Result<(), String> {
        if check_email(s).is_ok() {
            return Ok(());
        }

        if validate_phone(s) {
            return Ok(());
        }

        Err("Incorrect email or phone number".into())
    }
}
