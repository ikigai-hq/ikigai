use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

use crate::authorization::SpaceActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::*;
use crate::notification_center::send_notification;
use crate::util::get_now_as_secs;

#[derive(SimpleObject)]
pub struct SpaceJoinResponse {
    pub space_id: i32,
    pub should_go_to_space: bool,
}

#[derive(Default)]
pub struct SpaceMutation;

#[Object]
impl SpaceMutation {
    async fn space_create(&self, ctx: &Context<'_>, mut data: NewSpace) -> Result<Space> {
        let user = get_user_from_ctx(ctx).await?;
        data.creator_id = user.id;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let owned_spaces = Space::find_all_by_owner(&mut conn, user.id).format_err()?;
        if let Some(max_owned_space) = user.config().max_owned_space {
            if owned_spaces.len() as i64 >= max_owned_space {
                return Err(IkigaiError::new_bad_request(
                    "You've reached maximum owned space",
                ))
                .format_err();
            }
        }
        create_default_space(&mut conn, user.id).format_err()
    }

    async fn space_duplicate(&self, ctx: &Context<'_>, space_id: i32) -> Result<Space> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let new_class = duplicate_space(&mut conn, space_id, user_auth.id).format_err()?;
        Ok(new_class)
    }

    async fn space_update(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        data: UpdateSpaceData,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        Space::update(&mut conn, space_id, data).format_err()?;
        Ok(true)
    }

    async fn space_restore(&self, ctx: &Context<'_>, space_id: i32) -> Result<Space> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let class = Space::restore(&mut conn, space_id).format_err()?;
        Ok(class)
    }

    async fn space_soft_delete(&self, ctx: &Context<'_>, space_id: i32) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        Space::soft_remove(&mut conn, space_id).format_err()?;
        Ok(true)
    }

    async fn space_delete(&self, ctx: &Context<'_>, space_id: i32) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceSetting).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        Space::remove(&mut conn, space_id).format_err()?;
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

        let mut conn = get_conn_from_ctx(ctx).await?;

        let original_document = Document::find_by_id(&mut conn, document_id).format_err()?;
        if original_document.deleted_at.is_some() {
            return Err(IkigaiError::new_bad_request(
                "Cannot duplicate deleted document!",
            ))
            .format_err();
        }
        let last_index =
            Document::find_last_index(&mut conn, space_id, original_document.parent_id)?;
        let config = DocumentCloneConfigBuilder::default()
            .prefix_title("Copy of ")
            .index(last_index)
            .creator_id(user_auth.id)
            .parent_id(original_document.parent_id)
            .clone_to_space(Some(space_id))
            .clone_children(true)
            .keep_document_type(true)
            .build()
            .unwrap();

        let doc = conn
            .transaction::<_, IkigaiError, _>(|conn| original_document.deep_clone(conn, config))
            .format_err()?;

        let mut res: Vec<Document> = vec![];
        res.append(&mut get_all_documents_by_id(&mut conn, doc.id).format_err()?);
        res.push(doc);
        Ok(res)
    }

    async fn space_remove_member(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        user_id: i32,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceMember).await?;
        let current_user_id = get_user_id_from_ctx(ctx).await?;
        if current_user_id == user_id {
            return Err(IkigaiError::new_bad_request("Cannot remove your self")).format_err();
        }

        let mut conn = get_conn_from_ctx(ctx).await?;
        let space = Space::find_by_id(&mut conn, space_id).format_err()?;
        if space.creator_id == user_id {
            return Err(IkigaiError::new_bad_request("Cannot remove owner of space")).format_err();
        }
        SpaceMember::find(&mut conn, space_id, user_id).format_err()?;
        SpaceMember::remove(&mut conn, space_id, user_id).format_err()?;

        Ok(true)
    }

    async fn space_generate_invite_token(
        &self,
        ctx: &Context<'_>,
        mut data: SpaceInviteToken,
    ) -> Result<SpaceInviteToken> {
        space_quick_authorize(ctx, data.space_id, SpaceActionPermission::ManageSpaceMember).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        data.creator_id = get_user_id_from_ctx(ctx).await?;
        let item = SpaceInviteToken::upsert(&mut conn, data).format_err()?;

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

        let mut conn = get_conn_from_ctx(ctx).await?;
        let item =
            SpaceInviteToken::set_active(&mut conn, space_id, token, is_active).format_err()?;

        Ok(item)
    }

    async fn space_join_by_invite_token(
        &self,
        ctx: &Context<'_>,
        email: String,
        space_id: i32,
        token: String,
    ) -> Result<SpaceJoinResponse> {
        let authorized_user = get_user_from_ctx(ctx).await.ok();
        if authorized_user.as_ref().map(|user| user.email.as_str()) != Some(email.as_str()) {
            return Err(IkigaiError::new_bad_request(
                "Cannot join space by using different with authorized email",
            ))
            .format_err();
        }

        let mut conn = get_conn_from_ctx(ctx).await?;
        let space = Space::find_by_id(&mut conn, space_id).format_err()?;
        let space_invite_token =
            SpaceInviteToken::find(&mut conn, space_id, &token).format_err()?;

        if !space_invite_token.is_active {
            return Err(IkigaiError::new_bad_request("Link is inactive!")).format_err();
        }

        if let Some(expire_at) = space_invite_token.expire_at {
            let now = get_now_as_secs();
            if expire_at < now {
                return Err(IkigaiError::new_bad_request("Link is expired!")).format_err();
            }
        }

        let user = if let Some(user) = User::find_by_email_opt(&mut conn, &email)? {
            user
        } else {
            let new_user = NewUser::new(email.clone(), email, "".into());
            User::insert(&mut conn, &new_user).format_err()?
        };

        let current_space_member = SpaceMember::find(&mut conn, space.id, user.id);
        let is_new_space_member = current_space_member.is_err();
        let space_member = if let Ok(current_space_member) = current_space_member {
            current_space_member
        } else {
            SpaceInviteToken::increase_use(&mut conn, space.id, &token).format_err()?;
            add_space_member(
                &mut conn,
                &space,
                user.id,
                Some(token),
                space_invite_token.inviting_role,
            )
            .format_err()?
        };
        if authorized_user.is_none() {
            send_start_space_magic_link(&user, &space)?;
        }

        // Notify space owner
        if is_new_space_member {
            let notification = Notification::new_space_member_notification(NewSpaceMemberContext {
                space_name: space.name,
                space_id: space.id,
                email: user.email,
            });
            let notification = Notification::insert(&mut conn, notification).format_err()?;
            send_notification(&mut conn, notification, vec![space.creator_id]).format_err()?;
        }

        Ok(SpaceJoinResponse {
            space_id: space_member.space_id,
            should_go_to_space: authorized_user.is_some(),
        })
    }

    async fn space_remove_invite_token(
        &self,
        ctx: &Context<'_>,
        space_id: i32,
        invite_token: String,
    ) -> Result<bool> {
        space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceMember).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        SpaceInviteToken::remove(&mut conn, space_id, invite_token).format_err()?;

        Ok(true)
    }
}
