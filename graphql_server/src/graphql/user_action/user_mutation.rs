use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

use crate::authentication_token::Claims;
use crate::authorization::RubricActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::graphql::validator::Email;
use crate::helper::{
    create_default_space, get_conn_from_ctx, get_user_from_ctx, get_user_id_from_ctx,
    rubric_quick_authorize, send_start_space_magic_link,
};
use crate::service::google::verify_google_id_token;
use crate::service::redis::Redis;

#[derive(SimpleObject)]
pub struct UserToken {
    pub user: User,
    pub access_token: String,
}

#[derive(Default)]
pub struct UserMutation;

#[Object]
impl UserMutation {
    async fn user_signin_with_google(
        &self,
        ctx: &Context<'_>,
        id_token: String,
    ) -> Result<UserToken> {
        let id_token = verify_google_id_token(&id_token).await.format_err()?;
        let (user, _) = init_space_for_user_by_email(id_token.email, id_token.name, ctx).await?;
        let access_token = Claims::new(user.id).encode()?;

        Ok(UserToken { user, access_token })
    }

    async fn user_generate_magic_link(
        &self,
        ctx: &Context<'_>,
        #[graphql(validator(custom = "Email"))] email: String,
    ) -> Result<bool> {
        let (user, space) = init_space_for_user_by_email(email.clone(), email, ctx).await?;
        send_start_space_magic_link(&user, &space)
    }

    async fn user_check_magic_link(
        &self,
        ctx: &Context<'_>,
        user_id: i32,
        otp: String,
    ) -> Result<UserToken> {
        let magic_otp_user_id = Redis::init().get_magic_token(user_id, &otp);
        if magic_otp_user_id.is_err() {
            return Err(IkigaiError::new_bad_request(
                "Magic token is expired or incorrect!",
            ))
            .format_err();
        }

        let _ = Redis::init().del_magic_token(user_id, &otp);
        let mut conn = get_conn_from_ctx(ctx).await?;
        let user = User::find_by_id(&mut conn, user_id).format_err()?;
        let access_token = Claims::new(user_id).encode()?;

        Ok(UserToken { user, access_token })
    }

    async fn user_update_info(&self, ctx: &Context<'_>, input: UpdateUserData) -> Result<bool> {
        let user = get_user_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        User::update_info(&mut conn, user.id, input).format_err()?;
        Ok(true)
    }

    async fn user_upsert_rubric(&self, ctx: &Context<'_>, mut rubric: Rubric) -> Result<Rubric> {
        let existing_rubric = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Rubric::find_by_id(&mut conn, rubric.id)
        };

        if let Ok(existing_rubric) = existing_rubric {
            rubric_quick_authorize(
                ctx,
                existing_rubric.id,
                RubricActionPermission::ManageRubric,
            )
            .await?;
        }

        let user_id = get_user_id_from_ctx(ctx).await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        rubric.user_id = user_id;
        let rubric = Rubric::upsert(&mut conn, rubric).format_err()?;

        Ok(rubric)
    }

    async fn user_remove_rubric(&self, ctx: &Context<'_>, rubric_id: Uuid) -> Result<bool> {
        rubric_quick_authorize(ctx, rubric_id, RubricActionPermission::ManageRubric).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        Rubric::remove(&mut conn, rubric_id).format_err()?;

        Ok(true)
    }
}

async fn init_space_for_user_by_email(
    email: String,
    default_name: String,
    ctx: &Context<'_>,
) -> Result<(User, Space)> {
    let mut conn = get_conn_from_ctx(ctx).await?;
    let user = User::find_by_email_opt(&mut conn, &email).format_err()?;
    let res = match user {
        Some(user) => {
            let space_members = SpaceMember::find_all_by_user(&mut conn, user.id)?;
            let space = if let Some(space_member) = space_members.first() {
                Space::find_by_id(&mut conn, space_member.space_id).format_err()?
            } else {
                conn.transaction::<_, IkigaiError, _>(|conn| {
                    let space = create_default_space(conn, user.id)?;
                    Ok(space)
                })
                .format_err()?
            };

            (user, space)
        }
        None => {
            // Create user, org, and space
            conn.transaction::<_, IkigaiError, _>(|conn| {
                let user = NewUser::new(email.clone(), default_name, "".into());
                let user = User::insert(conn, &user)?;
                let space = create_default_space(conn, user.id)?;

                Ok((user, space))
            })
            .format_err()?
        }
    };

    Ok(res)
}
