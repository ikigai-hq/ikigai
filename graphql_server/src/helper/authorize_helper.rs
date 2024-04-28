use async_graphql::*;
use diesel::PgConnection;
use oso::Oso;
use uuid::Uuid;

use crate::authentication_token::{ActiveOrgId, Claims};
use crate::authorization::{
    DocumentActionPermission, DocumentAuth, OrganizationActionPermission, OrganizationAuth,
    SpaceActionPermission, SpaceAuth, UserAuth,
};
use crate::connection_pool::get_conn_from_actor;
use crate::db::*;
use crate::error::{OpenAssignmentError, OpenAssignmentErrorExt};
use crate::graphql::context_caching_data::RequestContextCachingData;

pub async fn get_conn_from_ctx(_ctx: &Context<'_>) -> Result<Connection> {
    let conn = get_conn_from_actor().await?;
    Ok(conn)
}

pub async fn get_active_org_id_from_ctx(ctx: &Context<'_>) -> Result<OrganizationIdentity> {
    if let Ok(active_org_id) = ctx.data::<ActiveOrgId>() {
        return Ok(active_org_id.0.into());
    }

    let user_id = get_user_id_from_ctx(ctx).await?;
    let conn = get_conn_from_ctx(ctx).await?;
    let org = OrganizationMember::find_all_by_user(&conn, user_id).format_err()?;
    if let Some(first_org) = org.first() {
        return Ok(first_org.org_id.into());
    }

    Err(OpenAssignmentError::new_unauthorized(
        "Cannot found active org id",
    ))
    .format_err()
}

pub async fn get_user_id_from_ctx(ctx: &Context<'_>) -> Result<i32> {
    if let Ok(claim) = ctx.data::<Claims>() {
        return Ok(claim.user_id);
    }

    Err(OpenAssignmentError::new_unauthorized(
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

pub async fn get_user_auth_by_user_id_from_ctx(
    ctx: &Context<'_>,
    user_id: i32,
) -> Result<UserAuth> {
    let caching_data = ctx.data::<RequestContextCachingData>()?;
    let user_auth = if let Some(user_auth) = caching_data.get_user_auth(user_id) {
        info!("Using cache user auth {:?}", user_auth);
        user_auth
    } else {
        let org_id = get_active_org_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let org_member = OrganizationMember::find(&conn, org_id, user_id).format_err()?;
        let user_auth = UserAuth::new(&conn, org_member)?;
        info!("Set cache user auth {:?}", user_auth);

        caching_data.add_user_auth(user_auth)
    };

    Ok(user_auth)
}

pub async fn get_user_auth_from_ctx(ctx: &Context<'_>) -> Result<UserAuth> {
    let user_id = get_user_id_from_ctx(ctx).await?;
    get_user_auth_by_user_id_from_ctx(ctx, user_id).await
}

pub async fn is_owner_of_file(ctx: &Context<'_>, user_id: i32, file_id: Uuid) -> Result<File> {
    let conn = get_conn_from_ctx(ctx).await?;
    user_is_owner_of_file(&conn, user_id, file_id)
}

pub fn user_is_owner_of_file(conn: &PgConnection, user_id: i32, file_id: Uuid) -> Result<File> {
    let file = File::find_by_id(conn, file_id).format_err()?;
    if file.user_id != user_id {
        return Err(OpenAssignmentError::new_bad_request(
            "You are not owner of this file",
        ))
        .format_err();
    }
    Ok(file)
}

pub async fn space_quick_authorize(
    ctx: &Context<'_>,
    space_id: i32,
    action: SpaceActionPermission,
) -> Result<()> {
    let user_auth = get_user_auth_from_ctx(ctx).await?;
    let is_allowed = space_is_allow(ctx, user_auth, space_id, action).await?;
    if !is_allowed {
        return Err(OpenAssignmentError::new_unauthorized(
            "You dont' have permission to do this action in class",
        ))
        .format_err()?;
    }

    Ok(())
}

pub async fn space_is_allow(
    ctx: &Context<'_>,
    user_auth: UserAuth,
    space_id: i32,
    action: SpaceActionPermission,
) -> Result<bool> {
    let oso = ctx.data::<Oso>()?;
    let user_id = user_auth.id;
    let caching_data = ctx.data::<RequestContextCachingData>()?;
    let class_auth = if let Some(space_auth) = caching_data.get_space_auth(space_id, user_id) {
        info!(
            "Use caching data of request info space auth {:?}",
            space_auth
        );
        space_auth
    } else {
        let conn = get_conn_from_ctx(ctx).await?;
        let class = Space::find_by_id(&conn, space_id).format_err()?;
        let class_auth = SpaceAuth::new(&class);
        info!("Set caching data of request info space {:?}", class_auth);
        caching_data.add_space_auth(space_id, user_id, class_auth)
    };
    let is_allowed = oso.is_allowed(user_auth, action.to_string(), class_auth)?;

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
        return Err(OpenAssignmentError::new_unauthorized(
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
    let user_auth = if current_user_id == user_id {
        // Try to fetch org member in caching instead
        get_user_auth_from_ctx(ctx).await?
    } else {
        let org_member = OrganizationMember::find(&conn, org_id, user_id).format_err()?;
        UserAuth::new(&conn, org_member).format_err()?
    };
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
        return Err(OpenAssignmentError::new_unauthorized(
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
        return Err(OpenAssignmentError::new_unauthorized(
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
        get_user_auth_by_user_id_from_ctx(ctx, user_id).await?
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
