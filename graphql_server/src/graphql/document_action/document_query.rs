use crate::authorization::DocumentActionPermission;
use async_graphql::*;
use uuid::Uuid;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::helper::*;

#[derive(Default)]
pub struct DocumentQuery;

#[Object]
impl DocumentQuery {
    async fn document_my_permissions(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
    ) -> Vec<DocumentActionPermission> {
        get_document_allowed_permissions(ctx, document_id)
            .await
            .unwrap_or_default()
    }

    async fn document_get(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<Document> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ViewDocument).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&mut conn, document_id).format_err()?;

        let user_id = get_user_id_from_ctx(ctx).await?;
        UserActivity::insert(&mut conn, user_id, document.id).format_err()?;

        Ok(document)
    }

    async fn document_get_assignees(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
    ) -> Result<Vec<DocumentAssignedUsers>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let assignees =
            DocumentAssignedUsers::find_all_by_document(&mut conn, document_id).format_err()?;
        Ok(assignees)
    }

    async fn document_get_embedded_sessions(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
    ) -> Result<Vec<EmbeddedSession>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let sessions =
            EmbeddedSession::find_all_by_document_id(&mut conn, document_id).format_err()?;
        Ok(sessions)
    }
}
