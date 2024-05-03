use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

use crate::authentication_token::Claims;
use crate::authorization::{DocumentActionPermission, SpaceActionPermission};
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::*;
use crate::notification_center::send_notification;
use crate::util::get_now_as_secs;

#[derive(SimpleObject)]
pub struct SpaceWithAccessToken {
    pub starter_document: Document,
    pub access_token: String,
}

#[derive(Default)]
pub struct SpaceMutation;

#[Object]
impl SpaceMutation {
    // FIXME: Check permission
    async fn space_create(&self, ctx: &Context<'_>, mut data: NewSpace) -> Result<Space> {
        let user = get_user_from_ctx(ctx).await?;
        data.creator_id = user.id;
        let conn = get_conn_from_ctx(ctx).await?;
        Space::insert(&conn, data).format_err()
    }

    // FIXME: Check permission, maybe only creator can do
    async fn space_duplicate(&self, ctx: &Context<'_>, space_id: i32) -> Result<Space> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let new_class = duplicate_class(&conn, space_id, user_auth.id).format_err()?;
        Ok(new_class)
    }

    async fn space_update(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        data: UpdateSpaceData,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Space::update(&conn, space_id, data).format_err()?;
        Ok(true)
    }

    async fn space_restore(&self, ctx: &Context<'_>, space_id: i32) -> Result<Space> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let class = Space::restore(&conn, space_id).format_err()?;
        Ok(class)
    }

    async fn space_soft_delete(&self, ctx: &Context<'_>, space_id: i32) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Space::soft_remove(&conn, space_id).format_err()?;
        Ok(true)
    }

    async fn space_delete(&self, ctx: &Context<'_>, space_id: i32) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Space::remove(&conn, space_id).format_err()?;
        Ok(true)
    }

    async fn space_duplicate_document(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        document_id: Uuid,
    ) -> Result<Vec<Document>> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;

        let original_document = Document::find_by_id(&conn, document_id).format_err()?;
        if original_document.deleted_at.is_some() {
            return Err(IkigaiError::new_bad_request(
                "Cannot duplicate deleted document!",
            ))
            .format_err();
        }
        let last_index = Document::find_last_index(&conn, space_id, original_document.parent_id)?;
        let mut config = DocumentCloneConfig::new("Copy of ", true);
        config.set_index(last_index);
        config.set_parent(original_document.parent_id);

        let doc = conn
            .transaction::<_, IkigaiError, _>(|| {
                original_document.deep_clone(
                    &conn,
                    user_auth.id,
                    config,
                    Some(space_id),
                    true,
                    None,
                    true,
                )
            })
            .format_err()?;

        let mut res: Vec<Document> = vec![];
        res.append(&mut get_all_documents_by_id(&conn, doc.id).format_err()?);
        res.push(doc);
        Ok(res)
    }

    async fn space_remove_document(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::delete(&conn, document_id).format_err()?;

        Ok(true)
    }

    async fn space_soft_delete_document(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        document_id: Uuid,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::soft_delete(&conn, document_id).format_err()?;

        Ok(true)
    }

    async fn space_soft_delete_multiple(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        document_ids: Vec<Uuid>,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let now = get_now_as_secs();
        Document::soft_delete_by_ids(&conn, document_ids, Some(now)).format_err()?;

        Ok(true)
    }

    async fn space_restore_soft_delete_document(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        document_ids: Vec<Uuid>,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::soft_delete_by_ids(&conn, document_ids, None).format_err()?;
        Ok(true)
    }

    async fn space_remove_member(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        user_id: i32,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceMember).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        SpaceMember::find(&conn, space_id, user_id).format_err()?;
        SpaceMember::remove(&conn, space_id, user_id).format_err()?;

        Ok(true)
    }

    async fn space_generate_invite_token(
        &self,
        ctx: &Context<'_>,
        mut data: SpaceInviteToken,
    ) -> Result<SpaceInviteToken> {
        space_quick_authorize(ctx, data.space_id, SpaceActionPermission::ManageSpaceMember).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        data.creator_id = get_user_id_from_ctx(ctx).await?;
        let item = SpaceInviteToken::upsert(&conn, data).format_err()?;

        Ok(item)
    }

    async fn space_set_active_invite_token(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        token: String,
        is_active: bool,
    ) -> Result<SpaceInviteToken> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceMember).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let item = SpaceInviteToken::set_active(&conn, space_id, token, is_active).format_err()?;

        Ok(item)
    }

    async fn space_join_by_invite_token(
        &self,
        ctx: &Context<'_>,
        email: String,
        space_id: i32,
        token: String,
    ) -> Result<SpaceWithAccessToken> {
        let conn = get_conn_from_ctx(ctx).await?;
        let space = Space::find_by_id(&conn, space_id).format_err()?;
        let space_invite_token = SpaceInviteToken::find(&conn, space_id, &token).format_err()?;

        if !space_invite_token.is_active {
            return Err(IkigaiError::new_bad_request("Link is inactive!")).format_err();
        }

        if let Some(expire_at) = space_invite_token.expire_at {
            let now = get_now_as_secs();
            if expire_at < now {
                return Err(IkigaiError::new_bad_request("Link is expired!")).format_err();
            }
        }

        let user = if let Some(user) = User::find_by_email_opt(&conn, &email)? {
            user
        } else {
            let new_user = NewUser::new(email.clone(), email, "".into());
            User::insert(&conn, &new_user).format_err()?
        };

        SpaceInviteToken::increase_use(&conn, space.id, &token).format_err()?;
        let space_member = add_space_member(
            &conn,
            &space,
            user.id,
            Some(token),
            space_invite_token.inviting_role,
        )
        .format_err()?;
        let claims = Claims::new(space_member.user_id);
        let access_token = claims.encode()?;
        let starter_document = Document::get_or_create_starter_doc(
            &conn,
            space_member.user_id,
            space_id,
            space.name.clone(),
        )
        .format_err()?;

        let notification = Notification::new_space_member_notification(NewSpaceMemberContext {
            space_name: space.name,
            space_id: space.id,
            email: user.email,
        });
        let notification = Notification::insert(&conn, notification).format_err()?;
        send_notification(&conn, notification, vec![space.creator_id]).format_err()?;

        Ok(SpaceWithAccessToken {
            starter_document,
            access_token,
        })
    }

    async fn space_remove_invite_token(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        invite_token: String,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceMember).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        SpaceInviteToken::remove(&conn, space_id, invite_token).format_err()?;

        Ok(true)
    }
}
