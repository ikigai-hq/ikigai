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

    async fn org_get_document_template_categories(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<Category>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Category::find_org_categories(&conn, user_auth.org_id).format_err()
    }

    async fn get_community_document_template_categories(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<Category>> {
        let conn = get_conn_from_ctx(ctx).await?;
        Category::find_community_categories(&conn).format_err()
    }

    async fn org_get_document_templates(&self, ctx: &Context<'_>) -> Result<Vec<DocumentTemplate>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        DocumentTemplate::find_org_templates(&conn, user_auth.org_id).format_err()
    }

    async fn get_community_document_templates(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<DocumentTemplate>> {
        let conn = get_conn_from_ctx(ctx).await?;
        DocumentTemplate::find_published_templates(&conn).format_err()
    }

    async fn org_get_tags(&self, ctx: &Context<'_>) -> Result<Vec<Tag>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Tag::find_org_tags_by_use_case(
            &conn,
            user_auth.org_id,
            TagUseCase::DocumentTemplateCategory,
        )
        .format_err()
    }
}
