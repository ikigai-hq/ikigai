use async_graphql::*;
use diesel::PgConnection;
use oso::Oso;
use uuid::Uuid;

use crate::authentication_token::Claims;
use crate::authorization::{
    ClassActionPermission, ClassAuth, DocumentActionPermission, DocumentAuth,
    OrganizationActionPermission, OrganizationAuth, UserAuth,
};
use crate::connection_pool::get_conn_from_actor;
use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::graphql::context_caching_data::RequestContextCachingData;

pub async fn get_conn_from_ctx(_ctx: &Context<'_>) -> Result<Connection> {
    let conn = get_conn_from_actor().await?;
    Ok(conn)
}

// Assume that application has only one organization
pub async fn get_active_org_id_from_ctx(ctx: &Context<'_>) -> Result<OrganizationIdentity> {
    let conn = get_conn_from_ctx(ctx).await?;
    Ok(Organization::find_first_org(&conn)?.id.into())
}

pub async fn get_user_id_from_ctx(ctx: &Context<'_>) -> Result<i32> {
    if let Ok(claim) = ctx.data::<Claims>() {
        return Ok(claim.user_id);
    }

    Err(OpenExamError::new_unauthorized(
        "Your request needs to provide token",
    ))
    .format_err()
}

pub async fn get_user_from_ctx(ctx: &Context<'_>) -> Result<User> {
    let caching_data = ctx.data::<RequestContextCachingData>()?;
    let user = if let Some(user) = caching_data.get_user() {
        info!("Use caching data of request info user {}", user.id);
        user
    } else {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let user = User::find_by_id(&conn, user_id).format_err()?;
        caching_data.add_user(user.clone());
        info!("Set caching data of request info user {}", user.id);
        user
    };

    Ok(user)
}

pub async fn get_org_from_ctx(ctx: &Context<'_>, org_id: i32) -> Result<Organization> {
    let caching_data = ctx.data::<RequestContextCachingData>()?;

    let org = if let Some(org) = caching_data.get_org_auth(org_id) {
        info!("Use caching data of request info organization {}", org.id);
        org
    } else {
        let conn = get_conn_from_ctx(ctx).await?;
        let org = Organization::find(&conn, org_id).format_err()?;
        info!("Set caching data of request info org {}", org.id);
        caching_data.add_org_auth(org)
    };

    Ok(org)
}

pub async fn get_org_member_by_user_id_from_ctx(
    ctx: &Context<'_>,
    user_id: i32,
) -> Result<OrganizationMember> {
    let caching_data = ctx.data::<RequestContextCachingData>()?;
    let member = if let Some(org_member) = caching_data.get_org_member(user_id) {
        info!("Using cache org member {:?}", org_member);
        org_member
    } else {
        let org_id = get_active_org_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let org_member = OrganizationMember::find(&conn, org_id, user_id).format_err()?;
        info!("Set cache org member {:?}", org_member);
        caching_data.add_org_member(org_member)
    };
    Ok(member)
}

pub async fn get_org_member_from_ctx(ctx: &Context<'_>) -> Result<OrganizationMember> {
    let user_id = get_user_id_from_ctx(ctx).await?;
    get_org_member_by_user_id_from_ctx(ctx, user_id).await
}

pub async fn is_owner_of_file(ctx: &Context<'_>, user_id: i32, file_id: Uuid) -> Result<File> {
    let conn = get_conn_from_ctx(ctx).await?;
    user_is_owner_of_file(&conn, user_id, file_id)
}

pub fn user_is_owner_of_file(conn: &PgConnection, user_id: i32, file_id: Uuid) -> Result<File> {
    let file = File::find_by_id(conn, file_id).format_err()?;
    if file.user_id != user_id {
        return Err(OpenExamError::new_bad_request(
            "You are not owner of this file",
        ))
        .format_err();
    }
    Ok(file)
}

pub async fn class_quick_authorize(
    ctx: &Context<'_>,
    class_id: i32,
    action: ClassActionPermission,
) -> Result<()> {
    let org_member = get_org_member_from_ctx(ctx).await?;
    let is_allowed = class_is_allowed(ctx, org_member, class_id, action).await?;
    if !is_allowed {
        return Err(OpenExamError::new_unauthorized(
            "You dont' have permission to do this action in class",
        ))
        .format_err()?;
    }

    Ok(())
}

pub async fn class_is_allowed(
    ctx: &Context<'_>,
    org_member: OrganizationMember,
    class_id: i32,
    action: ClassActionPermission,
) -> Result<bool> {
    let oso = ctx.data::<Oso>()?;
    let user_id = org_member.user_id;
    let caching_data = ctx.data::<RequestContextCachingData>()?;
    let user = UserAuth::from(org_member);
    let class_auth = if let Some(class_auth) = caching_data.get_class_auth(class_id, user_id) {
        info!(
            "Use caching data of request info class auth {:?}",
            class_auth
        );
        class_auth
    } else {
        let conn = get_conn_from_ctx(ctx).await?;
        let class = Class::find_by_id(&conn, class_id).format_err()?;
        let class_member = Member::find_opt(&conn, class.id, user_id).format_err()?;
        let class_auth = ClassAuth::new(&class, &class_member);
        info!("Set caching data of request info member {:?}", class_auth);
        caching_data.add_class_auth(class_id, user_id, class_auth)
    };
    let is_allowed = oso.is_allowed(user, action.to_string(), class_auth)?;

    Ok(is_allowed)
}

pub async fn organization_authorize(
    ctx: &Context<'_>,
    user_id: i32,
    org_id: i32,
    action: OrganizationActionPermission,
) -> Result<()> {
    let is_allowed = organization_is_allowed(ctx, user_id, org_id, action).await?;
    if !is_allowed {
        return Err(OpenExamError::new_unauthorized(
            "You dont' have permission to do this action in organization",
        ))
        .format_err()?;
    }

    Ok(())
}

pub async fn organization_is_allowed(
    ctx: &Context<'_>,
    user_id: i32,
    org_id: i32,
    action: OrganizationActionPermission,
) -> Result<bool> {
    let oso = ctx.data::<Oso>()?;
    let current_user_id = get_user_id_from_ctx(ctx).await?;
    let organization = get_org_from_ctx(ctx, org_id).await?;
    let conn = get_conn_from_ctx(ctx).await?;
    let org_member = if current_user_id == user_id {
        // Try to fetch org member in caching instead
        get_org_member_from_ctx(ctx).await?
    } else {
        OrganizationMember::find(&conn, org_id, user_id).format_err()?
    };
    let user_auth = UserAuth::from(org_member);
    let organization_auth = OrganizationAuth::from(organization);
    let is_allowed = oso.is_allowed(user_auth, action.to_string(), organization_auth)?;

    Ok(is_allowed)
}

pub async fn document_quick_authorize(
    ctx: &Context<'_>,
    document_id: Uuid,
    action: DocumentActionPermission,
) -> Result<()> {
    let current_user_id = get_user_id_from_ctx(ctx).await.ok();
    let is_allowed = document_is_allowed(ctx, current_user_id, document_id, action).await?;
    if !is_allowed {
        return Err(OpenExamError::new_unauthorized(
            "You dont' have permission to do this action in document",
        ))
        .format_err()?;
    }

    Ok(())
}

pub async fn document_authorize(
    ctx: &Context<'_>,
    user_id: i32,
    document_id: Uuid,
    action: DocumentActionPermission,
) -> Result<()> {
    let is_allowed = document_is_allowed(ctx, Some(user_id), document_id, action).await?;
    if !is_allowed {
        return Err(OpenExamError::new_unauthorized(
            "You dont' have permission to do this action in document",
        ))
        .format_err()?;
    }

    Ok(())
}

pub async fn document_is_allowed(
    ctx: &Context<'_>,
    user_id: Option<i32>,
    document_id: Uuid,
    action: DocumentActionPermission,
) -> Result<bool> {
    let oso = ctx.data::<Oso>()?;
    let caching_data = ctx.data::<RequestContextCachingData>()?;

    let user = if let Some(user_id) = user_id {
        let org_member = get_org_member_by_user_id_from_ctx(ctx, user_id).await?;
        UserAuth::from(org_member)
    } else {
        // Unauthorized user
        UserAuth::init_dummy()
    };

    let doc = if let Some(doc) = caching_data.get_document_auth(document_id) {
        info!("Using cache document {}", doc.id);
        doc
    } else {
        let conn = get_conn_from_ctx(ctx).await?;
        let doc = DocumentAuth::try_new(&conn, document_id).format_err()?;
        caching_data.add_document_auth(document_id, doc.clone());
        info!("Set cache document {}", doc.id);
        doc
    };
    let is_allowed = oso.is_allowed(user, action.to_string(), doc)?;

    Ok(is_allowed)
}

pub enum UserAction {
    ViewMember,
    EditInfoMember,
}

impl ToString for UserAction {
    fn to_string(&self) -> String {
        match self {
            Self::ViewMember => "view_member",
            Self::EditInfoMember => "edit_info_member",
        }
        .into()
    }
}

pub async fn user_authorize(
    ctx: &Context<'_>,
    user_id: i32,
    other_user_id: i32,
    action: UserAction,
) -> Result<()> {
    let is_allowed = user_is_allowed(ctx, user_id, other_user_id, action).await?;
    if !is_allowed {
        return Err(OpenExamError::new_unauthorized(
            "You dont' have permission to do this action",
        ))
        .format_err()?;
    }

    Ok(())
}

pub async fn user_is_allowed(
    ctx: &Context<'_>,
    user_id: i32,
    other_user_id: i32,
    action: UserAction,
) -> Result<bool> {
    let oso = ctx.data::<Oso>()?;
    let user: UserAuth = get_org_member_by_user_id_from_ctx(ctx, user_id)
        .await?
        .into();
    let other_user: UserAuth = get_org_member_by_user_id_from_ctx(ctx, other_user_id)
        .await?
        .into();

    println!("Hello {user:?} {other_user:?}");

    let is_allowed = oso.is_allowed(user, action.to_string(), other_user)?;

    Ok(is_allowed)
}
