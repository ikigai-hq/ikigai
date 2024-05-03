use async_graphql::*;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::helper::*;

#[derive(Default)]
pub struct AssignmentQuery;

#[Object]
impl AssignmentQuery {
    async fn assignment_get_band_scores(&self, ctx: &Context<'_>) -> Result<Vec<BandScore>> {
        let conn = get_conn_from_ctx(ctx).await?;
        let band_scores = BandScore::find_all(&conn).format_err()?;
        Ok(band_scores)
    }

    async fn assignment_my_submission(
        &self,
        ctx: &Context<'_>,
        assignment_id: i32,
    ) -> Result<Option<Submission>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Submission::find_last_submission(&conn, user_id, assignment_id).format_err()
    }
}
