pub mod organization_mutation;
pub mod organization_query;

pub use organization_mutation::*;
pub use organization_query::*;

use crate::authorization::OrganizationActionPermission;
use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};

use crate::db::*;
use crate::error::OpenAssignmentErrorExt;
use crate::graphql::data_loader::{
    FindOrgById, FindPublicUserById, FindUserById, OpenAssignmentDataLoader,
};
use crate::graphql::user_action::PersonInformation;
use crate::helper::{get_conn_from_ctx, get_user_id_from_ctx, organization_authorize};

#[ComplexObject]
impl Organization {
    async fn members(&self, ctx: &Context<'_>) -> Result<Vec<OrganizationMember>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            self.id,
            OrganizationActionPermission::ViewMemberPublicInformation,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let members = OrganizationMember::find_all_by_org(&conn, self.id).format_err()?;
        Ok(members)
    }
}

#[ComplexObject]
impl OrganizationMember {
    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        let loader = ctx.data_unchecked::<DataLoader<OpenAssignmentDataLoader>>();
        let user = loader
            .load_one(FindPublicUserById(self.user_id))
            .await?
            .ok_or(format!("Cannot load user {}!", self.user_id))?;
        Ok(user)
    }

    async fn organization(&self, ctx: &Context<'_>) -> Result<PublicOrganizationInformation> {
        let loader = ctx.data_unchecked::<DataLoader<OpenAssignmentDataLoader>>();
        let org = loader
            .load_one(FindOrgById {
                org_id: self.org_id,
            })
            .await?
            .ok_or(format!("Cannot load user {}!", self.org_id))?;
        Ok(org.into())
    }

    async fn personal_information(&self, ctx: &Context<'_>) -> Result<PersonInformation> {
        let loader = ctx.data_unchecked::<DataLoader<OpenAssignmentDataLoader>>();
        let user = loader
            .load_one(FindUserById(self.user_id))
            .await?
            .ok_or(format!("Cannot load user {}!", self.user_id))?;
        Ok(PersonInformation::new(user))
    }
}
