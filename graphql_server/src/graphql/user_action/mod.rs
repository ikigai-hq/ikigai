pub mod user_mutation;
pub mod user_query;

pub use user_mutation::*;
pub use user_query::*;

use crate::authorization::UserAuth;
use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};
use uuid::Uuid;

use crate::db::*;
use crate::error::OpenExamErrorExt;
use crate::graphql::data_loader::{
    ClassMemberByUserId, FileById, FindOrganizationMember, OpenExamDataLoader,
};
use crate::helper::{get_active_org_id_from_ctx, get_conn_from_ctx, get_user_auth_from_ctx};

pub const COLOR_SET: [&str; 12] = [
    "#02677B", "#002366", "#0F52BA", "#FA8072", "#FFDAB9", "#f56a00", "#3C91E6", "#342E37",
    "#A2D729", "#FAFFFD", "#FA824C", "#474774",
];

pub fn get_random_color(id: i32) -> String {
    let index = id as usize % COLOR_SET.len();
    COLOR_SET[index].into()
}

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct PersonInformation {
    pub first_name: String,
    pub last_name: String,
    pub avatar_id: Option<Uuid>,
}

#[ComplexObject]
impl PersonInformation {
    async fn full_name(&self) -> String {
        format!("{} {}", self.first_name, self.last_name)
    }

    async fn avatar(&self, ctx: &Context<'_>) -> Option<File> {
        if let Some(avatar_id) = self.avatar_id {
            let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
            loader.load_one(FileById(avatar_id)).await.ok().flatten()
        } else {
            None
        }
    }
}

impl PersonInformation {
    pub fn new(user: User) -> Self {
        PersonInformation {
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_id: user.avatar_file_id,
        }
    }

    pub fn new_by_public_user(public_user: PublicUser) -> Self {
        PersonInformation {
            first_name: public_user.first_name,
            last_name: public_user.last_name,
            avatar_id: public_user.avatar_file_id,
        }
    }
}

#[ComplexObject]
impl User {
    async fn active_org_personal_information(&self) -> Option<PersonInformation> {
        Some(PersonInformation::new(self.clone()))
    }

    async fn active_user_auth(&self, ctx: &Context<'_>) -> Option<UserAuth> {
        get_user_auth_from_ctx(ctx).await.ok()
    }

    async fn active_organization(&self, ctx: &Context<'_>) -> Result<Option<Organization>> {
        let conn = get_conn_from_ctx(ctx).await?;
        let org = if let Ok(org_id) = get_active_org_id_from_ctx(ctx).await {
            Organization::find(&conn, org_id).ok()
        } else {
            None
        };

        Ok(org)
    }

    async fn members(&self, ctx: &Context<'_>) -> Result<Vec<OrganizationMember>> {
        let conn = get_conn_from_ctx(ctx).await?;
        let org_members = OrganizationMember::find_all_by_user(&conn, self.id).format_err()?;
        Ok(org_members)
    }

    async fn random_color(&self) -> String {
        get_random_color(self.id)
    }

    async fn avatar(&self, ctx: &Context<'_>) -> Result<Option<File>> {
        Ok(if let Some(avatar_file_id) = self.avatar_file_id {
            let conn = get_conn_from_ctx(ctx).await?;
            Some(File::find_by_id(&conn, avatar_file_id).format_err()?)
        } else {
            None
        })
    }
}

#[ComplexObject]
impl PublicUser {
    async fn random_color(&self) -> String {
        get_random_color(self.id)
    }

    async fn avatar(&self, ctx: &Context<'_>) -> Result<Option<File>> {
        Ok(if let Some(avatar_file_id) = self.avatar_file_id {
            let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
            loader.load_one(FileById(avatar_file_id)).await?
        } else {
            None
        })
    }

    async fn class_members(&self, ctx: &Context<'_>) -> Result<Vec<SpaceMember>> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let class_members = loader
            .load_one(ClassMemberByUserId(self.id))
            .await?
            .unwrap_or_default();
        Ok(class_members)
    }

    async fn org_member(&self, ctx: &Context<'_>) -> Result<Option<OrganizationMember>> {
        let org_id = get_active_org_id_from_ctx(ctx).await?;
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let org_member = loader
            .load_one(FindOrganizationMember {
                org_id,
                user_id: self.id,
            })
            .await?;
        Ok(org_member)
    }

    async fn org_personal_information(&self) -> Option<PersonInformation> {
        Some(PersonInformation::new_by_public_user(self.clone()))
    }
}
