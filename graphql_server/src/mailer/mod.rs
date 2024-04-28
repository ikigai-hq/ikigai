pub mod template;

use actix::{Actor, Context, Handler, Supervised, SystemService};
use lettre::message::{Mailbox, SinglePart};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};

use crate::error::IkigaiError;
use crate::mailer::template::{MagicLinkContext, NotificationMailContext, Template};

#[derive(Debug, Clone)]
pub struct SmtpServerInfo {
    pub sender_name: String,
    pub sender: String,
    pub smtp_endpoint: String,
    pub smtp_username: String,
    pub smtp_password: String,
    pub smtp_port: i32,
}

impl SmtpServerInfo {
    pub fn new(
        sender: String,
        sender_name: String,
        smtp_endpoint: String,
        smtp_username: String,
        smtp_password: String,
        smtp_port: i32,
    ) -> Self {
        Self {
            sender,
            sender_name,
            smtp_endpoint,
            smtp_username,
            smtp_password,
            smtp_port,
        }
    }

    pub fn init() -> Self {
        let smtp_username = std::env::var("SMTP_USERNAME").unwrap();
        let smtp_password = std::env::var("SMTP_PASSWORD").unwrap();
        let smtp_endpoint = std::env::var("SMTP_ENDPOINT").unwrap();
        let sender = std::env::var("SMTP_SENDER").unwrap();
        let sender_name = "ikigai".to_string();
        let smtp_port = 587;
        Self::new(
            sender,
            sender_name,
            smtp_endpoint,
            smtp_username,
            smtp_password,
            smtp_port,
        )
    }

    pub fn get_from_mailbox(&self) -> Result<Mailbox, IkigaiError> {
        Ok(format!("{} <{}>", self.sender_name, self.sender).parse()?)
    }
}

#[derive(Default)]
pub struct Mailer;

impl Mailer {
    pub fn send_email(
        smtp: SmtpServerInfo,
        to: Mailbox,
        subject: &str,
        body_html: &str,
    ) -> Result<(), IkigaiError> {
        info!("Send Email. Email: {}. Subject {}", to.email, subject);
        let from = smtp.get_from_mailbox()?;
        let email = Message::builder()
            .from(from)
            .to(to)
            .subject(subject)
            .singlepart(SinglePart::html(body_html.to_string()))?;
        Self::from_registry().do_send(SendEmail(email, smtp));
        Ok(())
    }

    pub fn send_notification_email(
        to_email: &str,
        name: String,
        title: String,
        description: String,
        button_name: String,
        button_url: String,
    ) -> Result<(), IkigaiError> {
        let to = format!("{name} <{to_email}>").parse()?;
        let subject = title.clone();
        let body_html = Template::render_notification(NotificationMailContext {
            name,
            title,
            description,
            button_name,
            button_url,
        })?;
        Self::send_email(SmtpServerInfo::init(), to, &subject, &body_html)
    }

    pub fn send_magic_link_email(to_email: &str, magic_link: String) -> Result<(), IkigaiError> {
        let to = format!("<{to_email}>").parse()?;
        let subject = "Magic link to access your space in ikigai".to_string();
        let body_html = Template::render_magic_link(MagicLinkContext { magic_link })?;
        Self::send_email(SmtpServerInfo::init(), to, &subject, &body_html)
    }
}

impl Actor for Mailer {
    type Context = Context<Self>;
}

impl SystemService for Mailer {}
impl Supervised for Mailer {}

#[derive(Debug, Message)]
#[rtype(reuslt = "()")]
pub struct SendEmail(pub Message, pub SmtpServerInfo);

impl Handler<SendEmail> for Mailer {
    type Result = ();

    fn handle(&mut self, msg: SendEmail, _: &mut Self::Context) {
        let SendEmail(message, smtp) = msg;
        let mailer = SmtpTransport::relay(&smtp.smtp_endpoint)
            .unwrap()
            .credentials(Credentials::new(smtp.smtp_username, smtp.smtp_password))
            .build();

        match mailer.send(&message) {
            Ok(_) => info!("Send email success."),
            Err(e) => error!("Cannot send email {:?} by error {:?}", message.headers(), e),
        }
    }
}
