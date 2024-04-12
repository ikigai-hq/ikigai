use lazy_static::lazy_static;
use tera::{Context, Tera};

use crate::error::OpenExamError;

fn get_mail_templates(locale: &str) -> Tera {
    let dir = format!("email_templates/{locale}/*.html");
    let mut tera = match Tera::new(&dir) {
        Ok(t) => t,
        Err(e) => {
            println!("Parsing error(s): {}", e);
            ::std::process::exit(1);
        }
    };
    tera.autoescape_on(vec![".html", ".sql"]);
    tera
}

lazy_static! {
    pub static ref EN_TEMPLATES: Tera = get_mail_templates("en");
}

#[derive(Serialize)]
pub struct NotificationMailContext {
    pub org_name: String,
    pub org_url: String,
    pub name: String,
    pub notification_title: String,
    pub notification_description: String,
    pub button_url: Option<String>,
}

#[derive(Serialize)]
pub struct InvitationMailContext {
    pub name: String,
    pub org_name: String,
    pub org_url: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct OTPMailContext {
    pub org_name: String,
    pub org_url: String,
    pub reason: String,
    pub name: String,
    pub otp: String,
}

const NOTIFICATION: &str = "notification.html";
const INVITATION: &str = "invitation.html";
const OTP: &str = "otp.html";

pub struct Template;

impl Template {
    pub fn render_invitation(context: InvitationMailContext) -> Result<String, OpenExamError> {
        Ok(EN_TEMPLATES.render(INVITATION, &Context::from_serialize(context)?)?)
    }

    pub fn render_otp(context: OTPMailContext) -> Result<String, OpenExamError> {
        Ok(EN_TEMPLATES.render(OTP, &Context::from_serialize(context)?)?)
    }

    #[allow(dead_code)]
    pub fn render_notification(context: NotificationMailContext) -> Result<String, OpenExamError> {
        Ok(EN_TEMPLATES.render(NOTIFICATION, &Context::from_serialize(context)?)?)
    }
}