use lazy_static::lazy_static;
use tera::{Context, Tera};

use crate::error::IkigaiError;

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
    pub name: String,
    pub title: String,
    pub description: String,
    pub button_url: String,
    pub button_name: String,
}

#[derive(Serialize)]
pub struct MagicLinkContext {
    pub magic_link: String,
}

const NOTIFICATION: &str = "notification.html";
const MAGIC_LINK: &str = "magic_link.html";

pub struct Template;

impl Template {
    pub fn render_magic_link(context: MagicLinkContext) -> Result<String, IkigaiError> {
        Ok(EN_TEMPLATES.render(MAGIC_LINK, &Context::from_serialize(context)?)?)
    }

    pub fn render_notification(context: NotificationMailContext) -> Result<String, IkigaiError> {
        Ok(EN_TEMPLATES.render(NOTIFICATION, &Context::from_serialize(context)?)?)
    }
}
