use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

use crate::authorization::OrganizationActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::{
    get_conn_from_ctx, get_user_auth_from_ctx, get_user_id_from_ctx, organization_authorize,
};

#[derive(Default)]
pub struct OrganizationMutation;

#[Object]
impl OrganizationMutation {
    async fn org_update(
        &self,
        ctx: &Context<'_>,
        org_id: i32,
        data: UpdateOrganizationData,
    ) -> Result<Organization> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            org_id,
            OrganizationActionPermission::ManageOrgInformation,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let org = Organization::update(&conn, org_id, data).format_err()?;
        Ok(org)
    }

    async fn org_remove_org_member(&self, ctx: &Context<'_>, user_id: i32) -> Result<bool> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::RemoveOrgMember,
        )
        .await?;

        if user_auth.id == user_id {
            return Err(IkigaiError::new_bad_request("Cannot remove yourself!")).format_err();
        }

        let conn = get_conn_from_ctx(ctx).await?;
        let org_member = OrganizationMember::find(&conn, user_auth.org_id, user_id).format_err()?;
        if org_member.org_id != user_auth.org_id {
            return Err(IkigaiError::new_bad_request(
                "Cannot remove account of another org!",
            ))
            .format_err();
        }

        let org = Organization::find(&conn, user_auth.org_id).format_err()?;
        if org.owner_id == Some(user_id) {
            return Err(IkigaiError::new_bad_request(
                "Cannot remove owner of organization!",
            ))
            .format_err();
        }

        conn.transaction::<_, IkigaiError, _>(|| {
            OrganizationMember::remove(&conn, user_auth.org_id, user_id)?;
            SpaceMember::remove_by_user(&conn, user_id)?;
            Ok(())
        })
        .format_err()?;

        Ok(true)
    }

    async fn org_upsert_rubric(&self, ctx: &Context<'_>, mut rubric: Rubric) -> Result<Rubric> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        rubric.user_id = user_id;
        let rubric = Rubric::upsert(&conn, rubric).format_err()?;

        Ok(rubric)
    }

    async fn org_remove_rubric(&self, ctx: &Context<'_>, rubric_id: Uuid) -> Result<bool> {
        let rubric = {
            let conn = get_conn_from_ctx(ctx).await?;
            Rubric::find_by_id(&conn, rubric_id).format_err()?
        };

        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            rubric.org_id,
            OrganizationActionPermission::ManageOrgInformation,
        )
        .await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Rubric::remove(&conn, rubric.id).format_err()?;

        Ok(true)
    }
}
