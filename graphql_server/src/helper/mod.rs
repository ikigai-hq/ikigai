pub mod authorize_helper;
pub mod document_helper;
pub mod submission_helper;

pub use authorize_helper::*;
pub use document_helper::*;
pub use submission_helper::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::*;
use diesel::{Connection as DieselConnection, PgConnection};
use uuid::Uuid;

use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::graphql::data_loader::{FindPublicUserById, IkigaiDataLoader};
use crate::mailer::Mailer;
use crate::service::redis::Redis;
use crate::service::Storage;
use crate::util::url_util::format_magic_link;
use crate::util::{generate_otp, get_now_as_secs};

pub async fn get_public_user_from_loader(ctx: &Context<'_>, user_id: i32) -> Result<PublicUser> {
    let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
    let user = loader
        .load_one(FindPublicUserById(user_id))
        .await?
        .ok_or(format!("Cannot found the user {}", user_id))?;
    Ok(user)
}

pub fn duplicate_space(
    conn: &mut PgConnection,
    space_id: i32,
    creator_id: i32,
) -> Result<Space, IkigaiError> {
    let space = Space::find_by_id(conn, space_id)?;
    let space_documents = Document::find_all_by_space(conn, space_id, false)?;

    conn.transaction::<_, IkigaiError, _>(|conn| {
        // Duplicate Class
        let mut new_space = NewSpace::from(space);
        new_space.creator_id = creator_id;
        let new_space = Space::insert(conn, new_space)?;

        for space_document in space_documents.into_iter() {
            if space_document.parent_id.is_none() && space_document.deleted_at.is_none() {
                let config = DocumentCloneConfigBuilder::default()
                    .prefix_title("")
                    .index(space_document.index)
                    .creator_id(creator_id)
                    .clone_to_space(Some(new_space.id))
                    .clone_children(true)
                    .keep_document_type(true)
                    .build()
                    .unwrap();
                space_document.deep_clone(conn, config)?;
            }
        }

        Ok(new_space)
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

        let mut conn = get_conn_from_ctx(ctx).await?;
        File::insert_download_url(
            &mut conn,
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

pub fn add_space_member(
    conn: &mut PgConnection,
    space: &Space,
    user_id: i32,
    token: Option<String>,
    role: Role,
) -> std::result::Result<SpaceMember, IkigaiError> {
    let new_member = SpaceMember::new(space.id, user_id, token, role);
    let new_member = SpaceMember::upsert(conn, new_member)?;

    Ok(new_member)
}

pub fn generate_magic_link(user_id: i32, document_id: Uuid) -> Result<String, IkigaiError> {
    let otp = generate_otp();
    Redis::init().set_magic_token(user_id, &otp)?;
    Ok(format_magic_link(document_id, &otp, user_id))
}

pub fn send_space_magic_link(user: &User, document_id: Uuid) -> Result<bool> {
    let magic_link = generate_magic_link(user.id, document_id).format_err()?;
    if let Err(reason) = Mailer::send_magic_link_email(&user.email, magic_link) {
        error!("Cannot send magic link to {}: {:?}", user.email, reason);
        Ok(false)
    } else {
        Ok(true)
    }
}

pub fn create_default_space(conn: &mut PgConnection, user_id: i32) -> Result<Space, IkigaiError> {
    let new_space = NewSpace {
        name: "My space".into(),
        updated_at: get_now_as_secs(),
        created_at: get_now_as_secs(),
        banner_id: None,
        creator_id: user_id,
    };
    conn.transaction::<_, IkigaiError, _>(|conn| {
        let space = Space::insert(conn, new_space)?;
        let space_member = SpaceMember::new(space.id, user_id, None, Role::Teacher);
        SpaceMember::upsert(conn, space_member)?;

        Ok(space)
    })
}
