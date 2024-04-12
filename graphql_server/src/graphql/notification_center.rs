use std::collections::HashMap;
use std::time::Duration;

use actix::fut::wrap_future;
use actix::*;
use tokio::sync::mpsc::Sender;

use crate::util::get_now_as_secs;

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq)]
pub enum SubmissionEventType {
    SubmitCompleted,
}

#[derive(Debug, Clone, Copy, SimpleObject)]
pub struct SubmissionEvent {
    pub submission_id: i32,
    pub event_type: SubmissionEventType,
}

#[derive(Default)]
pub struct NotificationCenter {
    // User Id - Document Id - (Time start listen, Document Event Listener)
    pub submission_subscribers: HashMap<i32, HashMap<i32, Vec<(i64, Sender<SubmissionEvent>)>>>,
}

impl Actor for NotificationCenter {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        ctx.run_interval(Duration::from_secs(1), |center, _| {
            for (_, submissions) in center.submission_subscribers.iter_mut() {
                for (_, senders) in submissions.iter_mut() {
                    // Only keep open sender
                    senders.retain(|(_, sender)| !sender.is_closed());
                }
            }
        });
    }
}

impl Supervised for NotificationCenter {}
impl SystemService for NotificationCenter {}

#[derive(Message)]
#[rtype(result = "()")]
pub struct SubmissionSubscribe {
    pub user_id: i32,
    pub submission_id: i32,
    pub sender: Sender<SubmissionEvent>,
}

impl Handler<SubmissionSubscribe> for NotificationCenter {
    type Result = ();

    fn handle(&mut self, msg: SubmissionSubscribe, _: &mut Self::Context) -> Self::Result {
        let now = get_now_as_secs();
        let item = (now, msg.sender);
        if let Some(submissions) = self.submission_subscribers.get_mut(&msg.user_id) {
            if let Some(senders) = submissions.get_mut(&msg.submission_id) {
                senders.push(item);
            } else {
                let senders = vec![item];
                submissions.insert(msg.submission_id, senders);
            }
        } else {
            let mut submissions = HashMap::new();
            submissions.insert(msg.submission_id, vec![item]);
            self.submission_subscribers.insert(msg.user_id, submissions);
        }
    }
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct SubmitCompleted {
    pub user_id: i32,
    pub submission_id: i32,
}

impl Handler<SubmitCompleted> for NotificationCenter {
    type Result = ();

    fn handle(&mut self, msg: SubmitCompleted, ctx: &mut Self::Context) -> Self::Result {
        let event = SubmissionEvent {
            submission_id: msg.submission_id,
            event_type: SubmissionEventType::SubmitCompleted,
        };

        if let Some(submissions) = self.submission_subscribers.get(&msg.user_id) {
            if let Some(senders) = submissions.get(&msg.submission_id) {
                let cloned_senders = senders.clone();
                let task = async move {
                    for (_, sender) in cloned_senders {
                        let _ = sender.send(event).await;
                    }
                };

                wrap_future::<_, Self>(task).spawn(ctx)
            }
        }
    }
}
