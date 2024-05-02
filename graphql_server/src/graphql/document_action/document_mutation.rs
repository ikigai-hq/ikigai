use async_graphql::*;
use diesel::Connection;
use itertools::Itertools;
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::error::{IkigaiError, IkigaiErrorExt};
use crate::helper::*;
use crate::notification_center::send_notification;
use crate::util::get_now_as_secs;

#[derive(Default)]
pub struct DocumentMutation;

#[Object]
impl DocumentMutation {
    async fn document_create(
        &self,
        ctx: &Context<'_>,
        mut data: Document,
        space_id: Option<i32>,
        is_assignment: bool,
    ) -> Result<Document> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        data.id = Uuid::new_v4();
        data.creator_id = user_auth.id;
        data.org_id = user_auth.org_id;
        data.updated_by = Some(user_auth.id);
        data.space_id = space_id;
        data.updated_at = get_now_as_secs();
        data.created_at = get_now_as_secs();

        let conn = get_conn_from_ctx(ctx).await?;
        let doc = conn
            .transaction::<_, IkigaiError, _>(|| {
                let doc = Document::upsert(&conn, data)?;
                if is_assignment {
                    let new_assignment = NewAssignment::init(doc.id);
                    Assignment::insert(&conn, new_assignment)?;
                }

                Ok(doc)
            })
            .format_err()?;
        Ok(doc)
    }

    async fn document_update(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
        mut data: UpdateDocumentData,
    ) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::EditDocument).await?;

        let user_id = get_user_id_from_ctx(ctx).await?;
        data.updated_by = Some(user_id);
        let conn = get_conn_from_ctx(ctx).await?;
        Document::update(&conn, document_id, data).format_err()?;

        Ok(true)
    }

    async fn document_update_positions(
        &self,
        ctx: &Context<'_>,
        mut items: Vec<UpdatePositionData>,
    ) -> Result<bool> {
        get_user_from_ctx(ctx).await?;
        items = items.into_iter().unique_by(|item| item.id).collect();
        for item in &items {
            document_quick_authorize(ctx, item.id, DocumentActionPermission::EditDocument).await?;
        }

        let conn = get_conn_from_ctx(ctx).await?;
        Document::update_positions(&conn, items).format_err()?;

        Ok(true)
    }

    async fn document_update_public(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
        is_public: bool,
    ) -> Result<bool> {
        let user = get_user_from_ctx(ctx).await?;
        document_authorize(
            ctx,
            user.id,
            document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::update_public(&conn, document_id, is_public).format_err()?;

        Ok(true)
    }

    async fn document_add_highlight(
        &self,
        ctx: &Context<'_>,
        mut new_highlight: NewDocumentHighlight,
    ) -> Result<DocumentHighlight> {
        let user = get_user_from_ctx(ctx).await?;
        document_authorize(
            ctx,
            user.id,
            new_highlight.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let highlight = conn
            .transaction::<_, IkigaiError, _>(|| {
                let thread = Thread::insert(
                    &conn,
                    NewThread {
                        creator_id: user.id,
                        title: "Document Highlight".into(),
                        updated_at: get_now_as_secs(),
                        created_at: get_now_as_secs(),
                    },
                )?;

                new_highlight.creator_id = user.id;
                new_highlight.thread_id = thread.id;
                let highlight = DocumentHighlight::insert(&conn, new_highlight)?;
                Ok(highlight)
            })
            .format_err()?;

        Ok(highlight)
    }

    async fn document_remove_highlight(
        &self,
        ctx: &Context<'_>,
        highlight_id: Uuid,
    ) -> Result<bool> {
        let user = get_user_from_ctx(ctx).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let highlight = DocumentHighlight::find_by_id(&conn, highlight_id).format_err()?;
        document_authorize(
            ctx,
            user.id,
            highlight.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;
        conn.transaction::<_, IkigaiError, _>(|| {
            DocumentHighlight::remove(&conn, highlight_id)?;
            Thread::remove(&conn, highlight.thread_id)?;
            Ok(())
        })
        .format_err()?;

        Ok(true)
    }

    async fn document_add_page_block(
        &self,
        ctx: &Context<'_>,
        data: PageBlock,
    ) -> Result<PageBlock> {
        document_quick_authorize(
            ctx,
            data.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let page_block = PageBlock::upsert(&conn, data).format_err()?;

        Ok(page_block)
    }

    async fn document_clone_page_block(
        &self,
        ctx: &Context<'_>,
        from_id: Uuid,
        to_id: Uuid,
        to_document_id: Uuid,
    ) -> Result<PageBlock> {
        let from_page_block = {
            let conn = get_conn_from_ctx(ctx).await?;
            PageBlock::find(&conn, from_id).format_err()?
        };

        document_quick_authorize(ctx, to_document_id, DocumentActionPermission::EditDocument)
            .await?;
        document_quick_authorize(
            ctx,
            from_page_block.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let mut to_document = Document::find_by_id(&conn, to_document_id).format_err()?;
        let mut clone_config = DocumentCloneConfig::new("", true);
        clone_config.set_org(to_document.org_id);
        let cloned_page_block = from_page_block
            .deep_clone(&conn, &mut to_document, &clone_config, false, to_id)
            .format_err()?;

        if let Some(cloned_page_block) = cloned_page_block {
            Ok(cloned_page_block)
        } else {
            Err(IkigaiError::new_bad_request("Cannot clone page block")).format_err()
        }
    }

    async fn document_add_page_block_document(
        &self,
        ctx: &Context<'_>,
        data: PageBlockDocument,
    ) -> Result<PageBlockDocument> {
        let page_block = {
            let conn = get_conn_from_ctx(ctx).await?;
            PageBlock::find(&conn, data.page_block_id).format_err()?
        };

        document_quick_authorize(
            ctx,
            data.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;
        document_quick_authorize(
            ctx,
            page_block.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let page_block_document = PageBlockDocument::upsert(&conn, data).format_err()?;

        Ok(page_block_document)
    }

    async fn document_restore(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::soft_delete_by_ids(&conn, vec![document_id], None).format_err()?;

        Ok(true)
    }

    async fn document_soft_delete(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::soft_delete(&conn, document_id).format_err()?;

        Ok(true)
    }

    async fn document_soft_delete_multiples(
        &self,
        ctx: &Context<'_>,
        document_ids: Vec<Uuid>,
    ) -> Result<bool> {
        for document_id in &document_ids {
            document_quick_authorize(ctx, *document_id, DocumentActionPermission::ManageDocument)
                .await?;
        }

        let conn = get_conn_from_ctx(ctx).await?;
        Document::soft_delete_by_ids(&conn, document_ids, Some(get_now_as_secs())).format_err()?;

        Ok(true)
    }

    async fn document_delete(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::delete(&conn, document_id).format_err()?;

        Ok(true)
    }

    async fn document_assign_users(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
        user_ids: Vec<i32>,
    ) -> Result<Vec<DocumentAssignedUser>> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&conn, document_id).format_err()?;

        if document.space_id.is_none() {
            return Err(IkigaiError::new_bad_request(
                "Assign users to document is only available for document in material of spaces",
            ))
            .format_err();
        }

        let user_ids = user_ids.into_iter().unique().collect();
        let members =
            SpaceMember::find_all_by_users_of_space(&conn, document.space_id.unwrap(), &user_ids)
                .format_err()?;
        if members.len() != user_ids.len() {
            return Err(IkigaiError::new_bad_request(
                "One or more users is not member of space",
            ))
            .format_err();
        }

        let items = conn
            .transaction::<_, IkigaiError, _>(|| {
                let items = user_ids
                    .iter()
                    .map(|user_id| DocumentAssignedUser::new(document_id, *user_id))
                    .collect();
                let items = DocumentAssignedUser::insert(&conn, items)?;

                let notification = Notification::new(
                    NotificationType::AssignToAssignment,
                    AssignToAssignmentContext {
                        assignment_document_id: document.id,
                        assignment_name: document.title,
                    },
                );
                let notification = Notification::insert(&conn, notification)?;
                send_notification(&conn, notification, user_ids)?;

                Ok(items)
            })
            .format_err()?;

        Ok(items)
    }

    async fn document_remove_assigned_user(
        &self,
        ctx: &Context<'_>,
        assigned_user: DocumentAssignedUser,
    ) -> Result<bool> {
        document_quick_authorize(
            ctx,
            assigned_user.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        DocumentAssignedUser::remove(&conn, assigned_user).format_err()?;

        Ok(true)
    }
}
