use async_graphql::*;

use crate::authentication_token::Claims;
use crate::db::user::{NewUser, UpdateUserData, User};
use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::graphql::scalar_type::OpenExamIdentity;
use crate::graphql::validator::*;
use crate::helper::user_helper::get_user_by_identity;
use crate::helper::{get_conn_from_ctx, get_user_from_ctx};
use crate::mailer::template::{OTPMailContext, Template};
use crate::mailer::Mailer;
use crate::service::redis::Redis;
use crate::util::generate_otp;

#[derive(SimpleObject)]
pub struct UserAndToken {
    pub user: User,
    pub org: Option<Organization>,
    pub access_token: String,
}

#[derive(Default)]
pub struct UserMutation;

#[derive(Debug, InputObject)]
pub struct AddUserData {
    pub identity: OpenExamIdentity,
    #[graphql(validator(custom = "Password"), default)]
    pub password: Option<String>,
    #[graphql(validator(max_length = 256))]
    pub first_name: String,
    #[graphql(validator(max_length = 256))]
    pub last_name: String,
    pub org_role: OrgRole,
}

#[derive(Debug, InputObject)]
pub struct SelfEnrollUserData {
    #[graphql(validator(custom = "Email"))]
    pub email: String,
    #[graphql(validator(custom = "PhoneNumber"))]
    pub phone_number: String,
    #[graphql(validator(max_length = 256))]
    pub first_name: String,
    #[graphql(validator(max_length = 256))]
    pub last_name: String,
}

#[Object]
impl UserMutation {
    async fn user_register(&self, ctx: &Context<'_>, data: AddUserData) -> Result<String> {
        if data.identity.email().is_none() {
            return Err(OpenExamError::new_bad_request("Missing email!")).format_err()?;
        }

        if data.password.is_none() {
            return Err(OpenExamError::new_bad_request("Missing password!")).format_err()?;
        }

        let email = data.identity.email().unwrap().to_string();
        let conn = get_conn_from_ctx(ctx).await?;

        let checked_user = User::find_by_email_opt(&conn, &email).format_err()?;
        if checked_user.is_some() {
            return Err(OpenExamError::new_bad_request(
                "Email is already registered!",
            ))
            .format_err()?;
        }

        let new_user = NewUser::new_basic(
            email,
            data.password.unwrap(),
            data.first_name,
            data.last_name,
        );
        let user = User::insert(&conn, &new_user)?;

        let token = Claims::new(user.id).encode().format_err()?;
        Ok(token)
    }

    async fn user_login(
        &self,
        ctx: &Context<'_>,
        identity: OpenExamIdentity,
        #[graphql(validator(custom = "Password"))] password: String,
    ) -> Result<String> {
        let conn = get_conn_from_ctx(ctx).await?;

        let user = get_user_by_identity(&conn, &identity)?;
        let user = match user {
            Some(user) if user.is_password(&password) => user,
            None => {
                return Err(OpenExamError::new_bad_request("User is not existed!")).format_err()
            }
            _ => return Err(OpenExamError::new_bad_request("Incorrect password!")).format_err(),
        };

        let token = Claims::new(user.id).encode().format_err()?;
        Ok(token)
    }

    async fn user_update_info(&self, ctx: &Context<'_>, input: UpdateUserData) -> Result<bool> {
        let user = get_user_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        User::update_info(&conn, user.id, input).format_err()?;
        Ok(true)
    }

    async fn user_update_password(
        &self,
        ctx: &Context<'_>,
        current_password: String,
        #[graphql(validator(custom = "Password"))] new_password: String,
    ) -> Result<bool> {
        let user = get_user_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        if !user.is_password(&current_password) {
            return Err(OpenExamError::new_bad_request(
                "Current password is incorrect",
            ))
            .format_err();
        }
        User::update_password(&conn, user.id, new_password).format_err()?;

        Ok(true)
    }

    async fn user_forgot_password(
        &self,
        ctx: &Context<'_>,
        identity: OpenExamIdentity,
    ) -> Result<bool> {
        let user = {
            let conn = get_conn_from_ctx(ctx).await?;
            get_user_by_identity(&conn, &identity)?
        };

        if user.is_none() {
            return Err(OpenExamError::new_bad_request("User is not existed")).format_err();
        }

        let user = user.unwrap();
        // FIXME: This is legacy, should be replace by new org branding forgot logic
        // Case 1: Forgot for custom domain
        // Case 2: Forgot for normal user
        let org = {
            let conn = get_conn_from_ctx(ctx).await?;
            let member = OrganizationMember::find_by_user(&conn, user.id).format_err()?;
            Organization::find(&conn, member.org_id).format_err()?
        };
        let otp = generate_otp();
        let redis = ctx.data::<Redis>()?;
        redis.set_reset_pwd_otp(user.id, &otp)?;

        match identity {
            OpenExamIdentity::Email(_) => {
                let reason = "Reset password".to_string();
                let subject = "Open Exam OTP for reset password";
                let body_html = Template::render_otp(OTPMailContext {
                    org_name: org.org_name.clone(),
                    org_url: org.get_org_url_address(),
                    name: user.name(),
                    reason,
                    otp,
                })?;
                Mailer::send_html_mail(org, &user.email, subject, &body_html)?;
            }
        }

        Ok(true)
    }

    async fn user_reset_password(
        &self,
        ctx: &Context<'_>,
        identity: OpenExamIdentity,
        otp: String,
        #[graphql(validator(custom = "Password"))] new_password: String,
    ) -> Result<bool> {
        let conn = get_conn_from_ctx(ctx).await?;
        let user = get_user_by_identity(&conn, &identity)?;

        if user.is_none() {
            return Err(OpenExamError::new_bad_request("User is not existed")).format_err();
        }
        let user = user.unwrap();

        let redis = ctx.data::<Redis>()?;
        let redis_otp = redis.get_reset_pwd_otp(user.id);
        if Ok(otp) != redis_otp {
            return Err(OpenExamError::new_bad_request("OTP is expired or invalid.")).format_err();
        }

        info!("Reset password successfully!, User: {}", user.id);
        User::update_password(&conn, user.id, new_password)?;
        let _ = redis.del_reset_pwd_otp(user.id);

        Ok(true)
    }
}
