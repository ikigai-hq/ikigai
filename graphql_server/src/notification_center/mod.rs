use std::fmt::Debug;

use actix::fut::wrap_future;
use actix::*;
use async_graphql::async_trait::async_trait;
use diesel::PgConnection;
use dyn_clone::DynClone;

use crate::connection_pool::get_conn_from_actor;
use crate::db::*;
use crate::error::IkigaiError;
use crate::mailer::Mailer;

pub fn send_notification(
    conn: &mut PgConnection,
    notification: Notification,
    receiver_ids: Vec<i32>,
) -> Result<(), IkigaiError> {
    let receivers = receiver_ids
        .iter()
        .map(|receiver_id| NotificationReceiver::new(notification.id, *receiver_id))
        .collect();
    NotificationReceiver::upsert(conn, receivers)?;
    NotificationCenter::from_registry().do_send(SendNotification { notification });
    Ok(())
}

pub fn parse_context(notification: &Notification) -> Option<Box<dyn ContextMessage>> {
    match notification.notification_type {
        NotificationType::NewSpaceMember => {
            let value =
                serde_json::from_value::<NewSpaceMemberContext>(notification.context.clone())
                    .ok()?;
            Some(Box::new(value))
        }
        NotificationType::SubmitSubmission => {
            let value =
                serde_json::from_value::<SubmitSubmissionContext>(notification.context.clone())
                    .ok()?;
            Some(Box::new(value))
        }
        NotificationType::FeedbackSubmission => {
            let value =
                serde_json::from_value::<FeedbackSubmissionContext>(notification.context.clone())
                    .ok()?;
            Some(Box::new(value))
        }
        NotificationType::AssignToAssignment => {
            let value =
                serde_json::from_value::<AssignToAssignmentContext>(notification.context.clone())
                    .ok()?;
            Some(Box::new(value))
        }
    }
}

#[async_trait]
pub trait NotificationSender: Debug + DynClone {
    async fn send(&self, to: &User, notification: &Notification) -> Result<(), IkigaiError>;
}

dyn_clone::clone_trait_object!(NotificationSender);

#[derive(Debug, Clone)]
pub struct MailSender;

#[async_trait]
impl NotificationSender for MailSender {
    async fn send(&self, user: &User, notification: &Notification) -> Result<(), IkigaiError> {
        if let Some(context) = parse_context(notification) {
            Mailer::send_notification_email(
                &user.email,
                user.name(),
                context.get_title(),
                context.get_message(),
                context.get_action_name(),
                context.get_url_path(user),
            )?;
        }

        Ok(())
    }
}

#[derive(Default)]
pub struct NotificationCenter {
    pub senders: Vec<Box<dyn NotificationSender>>,
}

impl Actor for NotificationCenter {
    type Context = Context<Self>;

    fn started(&mut self, _: &mut Self::Context) {
        self.senders = vec![Box::new(MailSender)];
    }
}

impl Supervised for NotificationCenter {}
impl SystemService for NotificationCenter {}

#[derive(Message)]
#[rtype(result = "()")]
pub struct SendNotification {
    pub notification: Notification,
}

impl Handler<SendNotification> for NotificationCenter {
    type Result = ();

    fn handle(&mut self, msg: SendNotification, ctx: &mut Self::Context) -> Self::Result {
        // Safe because sender is Box.
        let senders = self.senders.clone();
        let task = async move {
            let mut conn = get_conn_from_actor().await?;
            let notification_receivers =
                NotificationReceiver::find_all_by_notification(&mut conn, msg.notification.id)?;
            let users = User::find_by_ids(
                &mut conn,
                &notification_receivers.iter().map(|n| n.user_id).collect(),
            )?;
            for sender in senders {
                for user in users.iter() {
                    if let Err(reason) = sender.send(user, &msg.notification).await {
                        error!(
                            "Cannot send notification to {user:?} by sender {sender:?}: {reason:?}"
                        );
                    }
                }
            }
            Ok(())
        };

        wrap_future::<_, Self>(task)
            .map(|_: Result<(), IkigaiError>, _, _| ())
            .spawn(ctx);
    }
}
