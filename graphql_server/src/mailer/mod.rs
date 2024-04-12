pub mod template;

use actix::{Actor, Context, Handler, Supervised, SystemService};
use lettre::message::{Mailbox, SinglePart};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};

use crate::db::Organization;
use crate::error::OpenExamError;
use crate::mailer::template::{InvitationMailContext, Template};
use crate::util::url_util::org_url;

#[derive(Debug, Clone)]
pub struct SmtpServerInfo {
    pub sender_name: String,
    pub sender: String,
    pub smtp_endpoint: String,
    pub smtp_username: String,
    pub smtp_password: String,
    pub smtp_port: i32,
}

impl From<Organization> for SmtpServerInfo {
    fn from(org: Organization) -> Self {
        Self::init(&org.org_name)
    }
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

    pub fn init(sender_name: &str) -> Self {
        let smtp_username = std::env::var("SMTP_USERNAME").unwrap();
        let smtp_password = std::env::var("SMTP_PASSWORD").unwrap();
        let smtp_endpoint = std::env::var("SMTP_ENDPOINT").unwrap();
        let sender = std::env::var("SMTP_SENDER").unwrap();
        let sender_name = format!("{sender_name} (via OpenExam)");
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

    pub fn get_from_mailbox(&self) -> Result<Mailbox, OpenExamError> {
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
    ) -> Result<(), OpenExamError> {
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

    pub fn send_member_invitation(
        org: Organization,
        to_email: &str,
        name: &str,
        password: &str,
    ) -> Result<(), OpenExamError> {
        let to = format!("{} <{}>", name, to_email).parse()?;
        let org_name = &org.org_name;
        let subject = format!("You've been added into {org_name} organization");
        let body_html = Template::render_invitation(InvitationMailContext {
            name: name.into(),
            org_name: org_name.into(),
            org_url: org_url(&org),
            email: to_email.into(),
            password: password.into(),
        })?;
        Self::send_email(SmtpServerInfo::from(org), to, &subject, &body_html)
    }

    pub fn send_html_mail(
        org: Organization,
        to_email: &str,
        subject: &str,
        body_html: &str,
    ) -> Result<(), OpenExamError> {
        let to = format!("<{}>", to_email).parse()?;
        Self::send_email(SmtpServerInfo::from(org), to, subject, body_html)
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
