use crate::authorization::{DocumentActionPermission, OrganizationActionPermission};
use async_graphql::*;
use uuid::Uuid;

use crate::db::*;
use crate::error::OpenAssignmentErrorExt;
use crate::helper::*;

#[derive(Default)]
pub struct DocumentQuery;

#[Object]
impl DocumentQuery {
    async fn document_get(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<Document> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ViewDocument).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&conn, document_id).format_err()?;

        let user_id = get_user_id_from_ctx(ctx).await?;
        UserActivity::insert(&conn, user_id, document.id).format_err()?;

        Ok(document)
    }

    async fn document_get_deleted_documents(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<Document>, Error> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::ManageTrash,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let documents = Document::find_deleted_documents(&conn, user_auth.org_id).format_err()?;
        Ok(documents)
    }
}
