use crate::authorization::{DocumentActionPermission, SpaceActionPermission};
use async_graphql::*;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::helper::*;

#[derive(Default)]
pub struct AssignmentQuery;

#[Object]
impl AssignmentQuery {
    async fn assignment_get_band_scores(&self, ctx: &Context<'_>) -> Result<Vec<BandScore>> {
        let mut conn = get_conn_from_ctx(ctx).await?;
        let band_scores = BandScore::find_all(&mut conn).format_err()?;
        Ok(band_scores)
    }

    async fn assignment_get_submissions(
        &self,
        ctx: &Context<'_>,
        assignment_id: i32,
    ) -> Result<Vec<Submission>> {
        let (assignment, document) = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let assignment = Assignment::find_by_id(&mut conn, assignment_id).format_err()?;
            let document = Document::find_by_id(&mut conn, assignment.document_id).format_err()?;
            (assignment, document)
        };
        document_quick_authorize(
            ctx,
            assignment.document_id,
            DocumentActionPermission::ViewDocument,
        )
        .await?;
        let view_all = if let Some(space_id) = document.space_id {
            space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceContent)
                .await
                .is_ok()
        } else {
            false
        };

        let mut conn = get_conn_from_ctx(ctx).await?;
        let submissions = if view_all {
            Submission::find_all_by_assignment(&mut conn, assignment_id).format_err()?
        } else {
            let user_id = get_user_id_from_ctx(ctx).await?;
            Submission::find_all_by_assignment_and_user(&mut conn, user_id, assignment_id)
                .format_err()?
        };

        Ok(submissions)
    }
}
