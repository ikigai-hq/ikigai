pub mod file_mutation;
pub mod file_query;

pub use file_mutation::*;
pub use file_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Enum, Result};
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::{File, JSONContent, Page, PageContent, PublicUser};
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::graphql::data_loader::{FindPublicUserById, IkigaiDataLoader};
use crate::helper::{document_quick_authorize, generate_download_url, get_conn_from_ctx};

#[derive(Enum, Debug, Clone, Copy, Eq, PartialEq)]
pub enum FileType {
    Folder,
    Video,
    Image,
    Document,
    Other,
}

#[ComplexObject]
impl File {
    async fn download_url_by_page_content_id(
        &self,
        ctx: &Context<'_>,
        page_content_id: Uuid,
    ) -> Result<Option<String>> {
        let document_id = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let page_content = PageContent::find(&mut conn, page_content_id).format_err()?;
            let json_content =
                serde_json::from_value::<JSONContent>(page_content.body).unwrap_or_default();
            if !json_content.has_file_handler(self.uuid) {
                return Err(IkigaiError::new_unauthorized("Page does not contain file."))
                    .format_err();
            }

            let page = Page::find(&mut conn, page_content.page_id).format_err()?;
            page.document_id
        };
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ViewDocument).await?;
        generate_download_url(self, ctx).await
    }

    async fn public_url(&self) -> Option<String> {
        self.get_public_url()
    }

    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let user = loader
            .load_one(FindPublicUserById(self.user_id))
            .await?
            .ok_or(format!("Not found user {}", self.user_id))?;

        Ok(user)
    }
}
