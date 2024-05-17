use actix::SystemService;

use crate::db::Submission;
use crate::error::IkigaiErrorExt;
use async_graphql::*;
use futures_core::Stream;
use tokio::sync::mpsc::channel;

use crate::authorization::DocumentActionPermission;
use crate::graphql::notification_center::*;
use crate::helper::{document_quick_authorize, get_conn_from_ctx, get_user_id_from_ctx};

#[derive(MergedObject, Default)]
pub struct Subscription;

#[Subscription]
impl Subscription {
    async fn submission_subscribe(
        &self,
        ctx: &Context<'_>,
        submission_id: i32,
    ) -> Result<impl Stream<Item = SubmissionEvent>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        {
            // I want release conn when this scope released.
            // Ensure that this document is existing
            let mut conn = get_conn_from_ctx(ctx).await?;
            let submission = Submission::find_by_id(&mut conn, submission_id).format_err()?;
            document_quick_authorize(
                ctx,
                submission.document_id,
                DocumentActionPermission::ViewDocument,
            )
            .await?;
        }
        let (sender, mut receiver) = channel(100);
        NotificationCenter::from_registry()
            .send(SubmissionSubscribe {
                user_id,
                submission_id,
                sender,
            })
            .await?;

        Ok(async_stream::stream! {
            while let Some(item) = receiver.recv().await {
                yield item;
            }
        })
    }
}
