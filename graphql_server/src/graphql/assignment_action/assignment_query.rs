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
}
