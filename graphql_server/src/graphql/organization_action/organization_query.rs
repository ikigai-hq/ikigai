use crate::db::*;
use crate::error::OpenExamErrorExt;
use crate::helper::{get_conn_from_ctx, get_user_auth_from_ctx};
use async_graphql::*;

#[derive(Default)]
pub struct OrganizationQuery;

#[Object]
impl OrganizationQuery {
    async fn org_get_rubrics(&self, ctx: &Context<'_>) -> Result<Vec<Rubric>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Rubric::find_all_by_org(&conn, user_auth.org_id).format_err()
    }
}
