use async_graphql::*;
use diesel::{Connection, PgConnection};
use uuid::Uuid;

use crate::authentication_token::Claims;
use crate::authorization::RubricActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::graphql::validator::Email;
use crate::helper::{
    get_conn_from_ctx, get_user_from_ctx, get_user_id_from_ctx, rubric_quick_authorize,
};
use crate::mailer::Mailer;
use crate::service::redis::Redis;
use crate::util::url_util::magic_link_for_document_url;
use crate::util::{generate_otp, get_now_as_secs};

#[derive(SimpleObject)]
pub struct UserToken {
    pub user: User,
    pub access_token: String,
}

fn create_default_space(
    conn: &PgConnection,
    user_id: i32,
    role: Role,
) -> Result<Space, IkigaiError> {
    let new_space = NewSpace {
        name: "My space".into(),
        updated_at: get_now_as_secs(),
        created_at: get_now_as_secs(),
        banner_id: None,
        creator_id: user_id,
    };
    let space = Space::insert(conn, new_space)?;
    let space_member = SpaceMember::new(space.id, user_id, None, role);
    SpaceMember::upsert(conn, space_member)?;

    Ok(space)
}

#[derive(Default)]
pub struct UserMutation;

#[Object]
impl UserMutation {
    async fn user_generate_magic_link(
        &self,
        ctx: &Context<'_>,
        #[graphql(validator(custom = "Email"))] email: String,
    ) -> Result<bool> {
        let conn = get_conn_from_ctx(ctx).await?;
        let user = User::find_by_email_opt(&conn, &email).format_err()?;
        let (user, document) = match user {
            Some(user) => {
                let space_members = SpaceMember::find_all_by_user(&conn, user.id)?;
                let document = if let Some(space_member) = space_members.first() {
                    let space = Space::find_by_id(&conn, space_member.space_id).format_err()?;
                    Document::get_or_create_starter_doc(
                        &conn,
                        space.creator_id,
                        space_member.space_id,
                        space.name,
                    )
                    .format_err()?
                } else {
                    conn.transaction::<_, IkigaiError, _>(|| {
                        let space = create_default_space(&conn, user.id, Role::Teacher)?;
                        let document = Document::get_or_create_starter_doc(
                            &conn, user.id, space.id, space.name,
                        )?;
                        Ok(document)
                    })
                    .format_err()?
                };

                (user, document)
            }
            None => {
                // Create user, org, and space
                conn.transaction::<_, IkigaiError, _>(|| {
                    let user = NewUser::new(email.clone(), email, "".into());
                    let user = User::insert(&conn, &user)?;
                    let space = create_default_space(&conn, user.id, Role::Teacher)?;
                    let document =
                        Document::get_or_create_starter_doc(&conn, user.id, space.id, space.name)?;

                    Ok((user, document))
                })
                .format_err()?
            }
        };

        let otp = generate_otp();
        Redis::init().set_magic_token(user.id, &otp).format_err()?;
        let magic_link = magic_link_for_document_url(document.id, &otp, user.id);
        if let Err(reason) = Mailer::send_magic_link_email(&user.email, magic_link) {
            error!("Cannot send magic link to {}: {:?}", user.email, reason);
            Ok(false)
        } else {
            Ok(true)
        }
    }

    async fn user_check_magic_link(
        &self,
        ctx: &Context<'_>,
        user_id: i32,
        otp: String,
    ) -> Result<UserToken> {
        let magic_otp = Redis::init().get_magic_token(user_id);
        if Ok(otp) != magic_otp {
            return Err(IkigaiError::new_bad_request(
                "Magic token is expired or incorrect!",
            ))
            .format_err();
        }

        let _ = Redis::init().del_magic_token(user_id);
        let conn = get_conn_from_ctx(ctx).await?;
        let user = User::find_by_id(&conn, user_id).format_err()?;
        let access_token = Claims::new(user_id).encode()?;

        Ok(UserToken { user, access_token })
    }

    async fn user_update_info(&self, ctx: &Context<'_>, input: UpdateUserData) -> Result<bool> {
        let user = get_user_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        User::update_info(&conn, user.id, input).format_err()?;
        Ok(true)
    }

    async fn user_upsert_rubric(&self, ctx: &Context<'_>, mut rubric: Rubric) -> Result<Rubric> {
        let existing_rubric = {
            let conn = get_conn_from_ctx(ctx).await?;
            Rubric::find_by_id(&conn, rubric.id)
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
        let conn = get_conn_from_ctx(ctx).await?;
        rubric.user_id = user_id;
        let rubric = Rubric::upsert(&conn, rubric).format_err()?;

        Ok(rubric)
    }

    async fn user_remove_rubric(&self, ctx: &Context<'_>, rubric_id: Uuid) -> Result<bool> {
        rubric_quick_authorize(ctx, rubric_id, RubricActionPermission::ManageRubric).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Rubric::remove(&conn, rubric_id).format_err()?;

        Ok(true)
    }
}
