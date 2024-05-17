pub mod user_mutation;
pub mod user_query;

pub use user_mutation::*;
pub use user_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};

use crate::authorization::UserAuth;
use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::graphql::data_loader::{FileById, IkigaiDataLoader};
use crate::helper::{get_conn_from_ctx, get_user_auth_from_ctx};

pub const COLOR_SET: [&str; 12] = [
    "#02677B", "#002366", "#0F52BA", "#FA8072", "#FFDAB9", "#f56a00", "#3C91E6", "#342E37",
    "#A2D729", "#FAFFFD", "#FA824C", "#474774",
];

pub fn get_random_color(id: i32) -> String {
    let index = id as usize % COLOR_SET.len();
    COLOR_SET[index].into()
}

#[ComplexObject]
impl User {
    async fn active_user_auth(&self, ctx: &Context<'_>) -> Option<UserAuth> {
        get_user_auth_from_ctx(ctx).await.ok()
    }

    async fn random_color(&self) -> String {
        get_random_color(self.id)
    }

    async fn avatar(&self, ctx: &Context<'_>) -> Result<Option<File>> {
        Ok(if let Some(avatar_file_id) = self.avatar_file_id {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Some(File::find_by_id(&mut conn, avatar_file_id).format_err()?)
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
            let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
            loader.load_one(FileById(avatar_file_id)).await?
        } else {
            None
        })
    }

    async fn name(&self) -> String {
        format!("{} {}", self.first_name, self.last_name)
    }
}
