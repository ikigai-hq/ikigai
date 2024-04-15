pub mod authorize_helper;
pub mod document_helper;
pub mod submission_helper;

pub use authorize_helper::*;
pub use document_helper::*;
pub use submission_helper::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::*;
use diesel::{Connection as DieselConnection, PgConnection};

use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::graphql::data_loader::{FindPublicUserById, OpenExamDataLoader};
use crate::service::Storage;
use crate::util::get_now_as_secs;

pub async fn get_public_user_from_loader(ctx: &Context<'_>, user_id: i32) -> Result<PublicUser> {
    let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
    let user = loader
        .load_one(FindPublicUserById(user_id))
        .await?
        .ok_or(format!("Cannot found the user {}", user_id))?;
    Ok(user)
}

pub fn duplicate_class(
    conn: &PgConnection,
    space_id: i32,
    org_id: i32,
    creator_id: i32,
) -> Result<Space, OpenExamError> {
    let space = Space::find_by_id(conn, space_id)?;
    let space_documents = Document::find_all_by_space(conn, space_id)?;

    conn.transaction::<_, OpenExamError, _>(|| {
        // Duplicate Class
        let mut new_space = NewSpace::from(space);
        new_space.org_id = org_id;
        new_space.creator_id = creator_id;
        let new_class = Space::insert(conn, new_space)?;

        // Duplicate Class Contents
        for space_document in space_documents.into_iter() {
            // Only process head of materials
            if space_document.parent_id.is_none() && space_document.deleted_at.is_none() {
                let mut config = DocumentCloneConfig::new("", true);
                config.set_org(org_id);
                config.set_index(space_document.index);
                space_document.deep_clone(
                    conn,
                    creator_id,
                    config,
                    Some(new_class.id),
                    true,
                    None,
                    true
                )?;
            }
        }

        Ok(new_class)
    })
}

pub async fn generate_download_url(file: &File, ctx: &Context<'_>) -> Result<Option<String>> {
    if file.public && file.content_type != FOLDER_MIME_TYPE && file.status == FileStatus::Success {
        return Ok(file.get_public_url());
    }

    let expire_in_next = 7200;
    if let (Some(download_url), Some(expire_in)) = (
        file.download_cached_url.clone(),
        file.download_url_expire_in,
    ) {
        if expire_in > get_now_as_secs() {
            return Ok(Some(download_url));
        }
    }

    let storage = Storage::from_env_config();
    if file.content_type != FOLDER_MIME_TYPE {
        let download_url = storage
            .get_download_url(&file.key(), expire_in_next, Some(file.file_name.clone()))
            .await
            .format_err()?;

        let conn = get_conn_from_ctx(ctx).await?;
        File::insert_download_url(
            &conn,
            file.uuid,
            download_url.as_str(),
            expire_in_next as i64,
        )
        .format_err()?;
        return Ok(Some(download_url));
    }

    warn!("We don't support to download folder!");
    Ok(None)
}
