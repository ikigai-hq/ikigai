use async_graphql::*;
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::*;

#[derive(SimpleObject)]
pub struct SharedDocument {
    pub document: Document,
    pub assignment: Assignment,
}

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

    async fn document_get_embedded_session(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
    ) -> Result<Option<EmbeddedSession>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;
        let mut conn = get_conn_from_ctx(ctx).await?;
        let session = EmbeddedSession::find_by_document(&mut conn, document_id).format_err()?;
        Ok(session)
    }

    async fn document_get_shared_info_by_session(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
        session_id: Uuid,
    ) -> Result<SharedDocument> {
        let mut conn = get_conn_from_ctx(ctx).await?;
        let session = EmbeddedSession::find(&mut conn, session_id).format_err()?;
        if session.document_id != document_id || !session.is_active {
            return Err(IkigaiError::new_bad_request("Inactive Session")).format_err();
        }

        let assignment = Assignment::find_by_document(&mut conn, document_id).format_err()?;
        if assignment.is_none() {
            return Err(IkigaiError::new_bad_request(
                "Document is not an assignment",
            ))
            .format_err();
        }
        let document = Document::find_by_id(&mut conn, document_id).format_err()?;

        Ok(SharedDocument {
            document,
            assignment: assignment.unwrap(),
        })
    }
}
