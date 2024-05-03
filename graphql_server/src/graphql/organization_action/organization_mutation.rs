use async_graphql::*;
use uuid::Uuid;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::helper::{get_conn_from_ctx, get_user_id_from_ctx};

#[derive(Default)]
pub struct OrganizationMutation;

#[Object]
impl OrganizationMutation {
    async fn org_upsert_rubric(&self, ctx: &Context<'_>, mut rubric: Rubric) -> Result<Rubric> {
        // FIXME: Should check authorization
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        rubric.user_id = user_id;
        let rubric = Rubric::upsert(&conn, rubric).format_err()?;

        Ok(rubric)
    }

    async fn org_remove_rubric(&self, ctx: &Context<'_>, rubric_id: Uuid) -> Result<bool> {
        // FIXME: Should check authorization
        let conn = get_conn_from_ctx(ctx).await?;
        Rubric::remove(&conn, rubric_id).format_err()?;

        Ok(true)
    }
}
