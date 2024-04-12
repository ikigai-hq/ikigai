use crate::authorization::OrganizationActionPermission;
use crate::db::*;
use crate::error::OpenExamErrorExt;
use crate::graphql::paging::{PagingInput, PagingResult};
use crate::helper::{
    get_conn_from_ctx, get_org_member_from_ctx, organization_authorize, user_authorize, UserAction,
};
use async_graphql::*;

#[derive(Debug, Clone, SimpleObject)]
pub struct OrganizationStats {
    pub total_teacher: i64,
    pub total_student: i64,
}

#[derive(InputObject)]
pub struct OrgMemberFilterOptions {
    pub keyword: Option<String>,
    pub role: Option<OrgRole>,
    pub class_id: Option<i32>,
    pub paging: PagingInput,
    pub created_at_from: Option<i64>,
    pub created_at_to: Option<i64>,
}

#[derive(Default)]
pub struct OrganizationQuery;

#[Object]
impl OrganizationQuery {
    async fn org_find_members(
        &self,
        ctx: &Context<'_>,
        filter_options: OrgMemberFilterOptions,
    ) -> Result<PagingResult<OrganizationMember>> {
        let org_member = get_org_member_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            org_member.user_id,
            org_member.org_id,
            OrganizationActionPermission::AddOrgMember,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let (offset, limit) = filter_options.paging.get();
        let (items, total) = OrganizationMember::filter_all(
            &conn,
            org_member.org_id,
            filter_options.keyword,
            filter_options.role,
            filter_options.created_at_from,
            filter_options.created_at_to,
            offset,
            limit,
        )?;

        Ok(PagingResult::new(items, total))
    }

    // TODO: This is temporary function
    async fn org_find_all_members(&self, ctx: &Context<'_>) -> Result<Vec<OrganizationMember>> {
        let org_member = get_org_member_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            org_member.user_id,
            org_member.org_id,
            OrganizationActionPermission::AddOrgMember,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        OrganizationMember::find_all_by_org(&conn, org_member.org_id).format_err()
    }

    async fn org_member_stats(&self, ctx: &Context<'_>) -> Result<OrganizationStats> {
        let org_member = get_org_member_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            org_member.user_id,
            org_member.org_id,
            OrganizationActionPermission::AddOrgMember,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let total_teacher =
            OrganizationMember::count_by_role(&conn, org_member.org_id, OrgRole::Teacher)
                .format_err()?;
        let total_student =
            OrganizationMember::count_by_role(&conn, org_member.org_id, OrgRole::Student)
                .format_err()?;

        Ok(OrganizationStats {
            total_teacher,
            total_student,
        })
    }

    async fn org_get_member(
        &self,
        ctx: &Context<'_>,
        member_user_id: i32,
    ) -> Result<OrganizationMember> {
        let org_member = get_org_member_from_ctx(ctx).await?;
        user_authorize(
            ctx,
            org_member.user_id,
            member_user_id,
            UserAction::ViewMember,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let member =
            OrganizationMember::find(&conn, org_member.org_id, member_user_id).format_err()?;

        Ok(member)
    }

    async fn org_get_rubrics(&self, ctx: &Context<'_>) -> Result<Vec<Rubric>> {
        let member = get_org_member_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Rubric::find_all_by_org(&conn, member.org_id).format_err()
    }

    async fn org_get_document_template_categories(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<Category>> {
        let member = get_org_member_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Category::find_org_categories(&conn, member.org_id).format_err()
    }

    async fn get_community_document_template_categories(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<Category>> {
        let conn = get_conn_from_ctx(ctx).await?;
        Category::find_community_categories(&conn).format_err()
    }

    async fn org_get_document_templates(&self, ctx: &Context<'_>) -> Result<Vec<DocumentTemplate>> {
        let member = get_org_member_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        DocumentTemplate::find_org_templates(&conn, member.org_id).format_err()
    }

    async fn get_community_document_templates(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<DocumentTemplate>> {
        let conn = get_conn_from_ctx(ctx).await?;
        DocumentTemplate::find_published_templates(&conn).format_err()
    }

    async fn org_get_tags(&self, ctx: &Context<'_>) -> Result<Vec<Tag>> {
        let member = get_org_member_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Tag::find_org_tags_by_use_case(&conn, member.org_id, TagUseCase::DocumentTemplateCategory)
            .format_err()
    }
}
