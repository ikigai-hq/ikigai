use crate::authorization::{ClassActionPermission, OrganizationActionPermission};
use async_graphql::*;

use crate::db::*;
use crate::error::OpenExamErrorExt;
use crate::helper::{
    class_quick_authorize, get_conn_from_ctx, get_org_member_from_ctx, organization_authorize,
};

#[derive(Default)]
pub struct ClassQuery;

#[Object]
impl ClassQuery {
    async fn class_get(&self, ctx: &Context<'_>, class_id: i32) -> Result<Class> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ViewClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let class = Class::find_by_id(&conn, class_id).format_err()?;
        Ok(class)
    }

    async fn class_get_deleted_classes(&self, ctx: &Context<'_>) -> Result<Vec<Class>> {
        let member = get_org_member_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            member.user_id,
            member.org_id,
            OrganizationActionPermission::RemoveClass,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let classes = Class::find_all_deleted_classes(&conn, member.org_id).format_err()?;
        Ok(classes)
    }

    // FIXME: Assume that a students and teacher has no more than 100 classes
    // If there are more than 100 classes -> we should use paginated list
    async fn class_get_all_org_classes(&self, ctx: &Context<'_>) -> Result<Vec<Class>> {
        let member = get_org_member_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            member.user_id,
            member.org_id,
            OrganizationActionPermission::AddClass,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let classes = Class::find_all_org_classes(&conn, member.org_id).format_err()?;
        Ok(classes)
    }

    async fn class_get_my_classes(&self, ctx: &Context<'_>) -> Result<Vec<Class>> {
        let member = get_org_member_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;

        let items = match member.org_role {
            OrgRole::Teacher => Class::find_all_org_classes(&conn, member.org_id).format_err()?,
            OrgRole::Student => {
                Class::find_my_classes(&conn, member.org_id, member.user_id).format_err()?
            }
        };

        Ok(items)
    }
}
