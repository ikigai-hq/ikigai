use async_graphql::*;
use diesel::{Connection, PgConnection};
use uuid::Uuid;

use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::graphql::scalar_type::OpenExamIdentity;
use crate::graphql::user_action::AddUserData;
use crate::mailer::Mailer;
use crate::util::generate_code;

pub fn insert_org_member(conn: &PgConnection, data: AddUserData, org_id: i32) -> Result<User> {
    let AddUserData {
        identity,
        password,
        first_name,
        last_name,
        org_role,
    } = data;

    let checked_user = get_user_by_identity(conn, &identity)?;
    if let Some(checked_user) = &checked_user {
        let current_org_member = OrganizationMember::find(conn, org_id, checked_user.id);
        // Already in organization, return it.
        if current_org_member.is_ok() {
            return Ok(checked_user.clone());
        }
    }

    let should_send_welcome_email = identity.email().is_some();
    let email = identity
        .email()
        .cloned()
        .unwrap_or(format!("openexam+{}@openexam.com", Uuid::new_v4()));
    let new_password = password.unwrap_or_else(generate_code);
    let cloned_password = new_password.clone();
    let new_user = conn
        .transaction::<_, OpenExamError, _>(|| {
            let new_user = if let Some(checked_user) = checked_user {
                let mut info = UpdateUserData::from(checked_user.clone());
                info.first_name = first_name;
                info.last_name = last_name;
                User::update_info(conn, checked_user.id, info)?;
                User::update_password(conn, checked_user.id, new_password)?;
                checked_user
            } else {
                let new_user = NewUser::new_basic(email, new_password, first_name, last_name);
                User::insert(conn, &new_user)?
            };

            let org_member = OrganizationMember::new(org_id, new_user.id, org_role);
            OrganizationMember::upsert(conn, org_member)?;

            Ok(new_user)
        })
        .format_err()?;

    if should_send_welcome_email {
        let org = Organization::find(conn, org_id).format_err()?;
        Mailer::send_member_invitation(
            org,
            &new_user.email,
            &format!("{} {}", new_user.first_name, new_user.last_name),
            &cloned_password,
        )?;
    }

    Ok(new_user)
}

pub fn get_user_by_identity(
    conn: &PgConnection,
    identity: &OpenExamIdentity,
) -> Result<Option<User>> {
    Ok(match identity {
        OpenExamIdentity::Email(email) => User::find_by_email_opt(conn, email).format_err()?,
    })
}
