use crate::authorization::{DocumentActionPermission, OrganizationActionPermission};
use async_graphql::*;
use uuid::Uuid;

use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::helper::*;

#[derive(Default)]
pub struct DocumentQuery;

#[Object]
impl DocumentQuery {
    async fn document_get(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<Document> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ViewDocument).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&conn, document_id).format_err()?;

        if let Ok(org_member) = get_org_member_from_ctx(ctx).await {
            if org_member.org_role == OrgRole::Student
                && !available_for_student(&document, org_member.user_id)
            {
                return Err(OpenExamError::new_bad_request(
                    "You don't have permission to read this document!",
                ))
                .format_err();
            }
        }

        Ok(document)
    }

    async fn document_get_deleted_documents(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<Document>, Error> {
        let member = get_org_member_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            member.user_id,
            member.org_id,
            OrganizationActionPermission::ManageTrash,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let documents = Document::find_deleted_documents(&conn, member.org_id).format_err()?;
        Ok(documents)
    }

    async fn document_get_history_versions(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
    ) -> Result<Vec<DocumentVersion>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let versions =
            DocumentVersion::find_by_document_id(&conn, document_id, None).format_err()?;

        Ok(versions)
    }
}
