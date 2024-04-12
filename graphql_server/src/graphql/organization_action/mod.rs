pub mod organization_mutation;
pub mod organization_query;

pub use organization_mutation::*;
pub use organization_query::*;

use crate::authorization::OrganizationActionPermission;
use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};

use crate::db::*;
use crate::error::OpenExamErrorExt;
use crate::graphql::data_loader::{
    FindCategoryTags, FindDocumentTemplateTags, FindOrgById, FindPublicUserById, FindUserById,
    OpenExamDataLoader,
};
use crate::graphql::user_action::PersonInformation;
use crate::helper::{
    get_conn_from_ctx, get_public_user_from_loader, get_user_id_from_ctx, organization_authorize,
};

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

    async fn org_url(&self) -> String {
        self.get_org_url_address()
    }
}

#[ComplexObject]
impl OrganizationMember {
    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let user = loader
            .load_one(FindPublicUserById(self.user_id))
            .await?
            .ok_or(format!("Cannot load user {}!", self.user_id))?;
        Ok(user)
    }

    async fn organization(&self, ctx: &Context<'_>) -> Result<PublicOrganizationInformation> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let org = loader
            .load_one(FindOrgById {
                org_id: self.org_id,
            })
            .await?
            .ok_or(format!("Cannot load user {}!", self.org_id))?;
        Ok(org.into())
    }

    async fn personal_information(&self, ctx: &Context<'_>) -> Result<PersonInformation> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let user = loader
            .load_one(FindUserById(self.user_id))
            .await?
            .ok_or(format!("Cannot load user {}!", self.user_id))?;
        Ok(PersonInformation::new(user))
    }
}

#[ComplexObject]
impl Category {
    async fn tags(&self, ctx: &Context<'_>) -> Result<Vec<CategoryTag>> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let tags = loader
            .load_one(FindCategoryTags {
                category_id: self.id,
            })
            .await?
            .unwrap_or_default();
        Ok(tags)
    }
}

#[ComplexObject]
impl DocumentTemplate {
    async fn creator(&self, ctx: &Context<'_>) -> Option<PublicUser> {
        if let Some(created_by) = self.created_by {
            get_public_user_from_loader(ctx, created_by).await.ok()
        } else {
            None
        }
    }

    async fn org(&self, ctx: &Context<'_>) -> Result<PublicOrganizationInformation> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let org = loader
            .load_one(FindOrgById {
                org_id: self.org_id,
            })
            .await?
            .ok_or(format!("Cannot load org {}!", self.org_id))?;
        let published_org = PublicOrganizationInformation::from(org);
        Ok(published_org)
    }

    async fn tags(&self, ctx: &Context<'_>) -> Result<Vec<DocumentTemplateTag>> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let tags = loader
            .load_one(FindDocumentTemplateTags {
                template_id: self.id,
            })
            .await?
            .unwrap_or_default();
        Ok(tags)
    }
}
