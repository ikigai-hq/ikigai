use async_graphql::*;
use diesel::Connection;
use itertools::Itertools;
use uuid::Uuid;

use crate::authorization::{
    DocumentActionPermission, OrganizationActionPermission, SpaceActionPermission,
};
use crate::background_job::document_job::insert_auto_version_history_jobs;
use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::helper::*;
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
            .transaction::<_, OpenExamError, _>(|| {
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
        let document = Document::find_by_id(&conn, document_id).format_err()?;
        let should_create_auto_version = document.body != data.body || document.title != data.title;
        Document::update(&conn, document_id, data).format_err()?;

        if should_create_auto_version {
            insert_auto_version_history_jobs(document_id, user_id);
        }

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
            .transaction::<_, OpenExamError, _>(|| {
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
        conn.transaction::<_, OpenExamError, _>(|| {
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
            Err(OpenExamError::new_bad_request("Cannot clone page block")).format_err()
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

    async fn document_apply_template(
        &self,
        ctx: &Context<'_>,
        original_document_id: Uuid,
        template_id: Uuid,
    ) -> Result<Document> {
        document_quick_authorize(
            ctx,
            original_document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        let template = {
            let conn = get_conn_from_ctx(ctx).await?;
            DocumentTemplate::find(&conn, template_id).format_err()?
        };
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            template.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let original_document = Document::find_by_id(&conn, original_document_id).format_err()?;
        create_a_document_version(
            &conn,
            user_auth.id,
            &original_document,
            &original_document.title,
            Some(user_auth.id),
        )
        .format_err()?;
        restore_document(
            &conn,
            user_auth.org_id,
            user_auth.id,
            original_document_id,
            template.document_id,
        )
        .format_err()
    }

    async fn document_create_version(
        &self,
        ctx: &Context<'_>,
        name: String,
        document_id: Uuid,
    ) -> Result<DocumentVersion> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let user_id = get_user_id_from_ctx(ctx).await?;
        let conn = get_conn_from_ctx(ctx).await?;
        let root_document = Document::find_by_id(&conn, document_id).format_err()?;
        create_a_document_version(&conn, user_id, &root_document, &name, Some(user_id)).format_err()
    }

    async fn document_update_version(
        &self,
        ctx: &Context<'_>,
        data: DocumentVersion,
    ) -> Result<DocumentVersion> {
        let updating_version = {
            let conn = get_conn_from_ctx(ctx).await?;
            DocumentVersion::find(&conn, data.id).format_err()?
        };
        document_quick_authorize(
            ctx,
            updating_version.root_document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        DocumentVersion::upsert(&conn, data).format_err()
    }

    async fn document_apply_history_version(
        &self,
        ctx: &Context<'_>,
        version_id: Uuid,
    ) -> Result<Document> {
        let version = {
            let conn = get_conn_from_ctx(ctx).await?;
            DocumentVersion::find(&conn, version_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            version.root_document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        let user_auth = get_user_auth_from_ctx(ctx).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let root_document = Document::find_by_id(&conn, version.root_document_id).format_err()?;
        let root_document_id = root_document.id;
        create_a_document_version(
            &conn,
            user_auth.id,
            &root_document,
            &root_document.title,
            Some(user_auth.id),
        )
        .format_err()?;
        restore_document(
            &conn,
            user_auth.org_id,
            user_auth.id,
            root_document_id,
            version.versioning_document_id,
        )
        .format_err()
    }

    async fn document_duplicate_to_class(
        &self,
        ctx: &Context<'_>,
        original_document_id: Uuid,
        class_id: i32,
    ) -> Result<Document> {
        document_quick_authorize(
            ctx,
            original_document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;
        space_quick_authorize(ctx, class_id, SpaceActionPermission::ManageSpaceContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        duplicate_document_to_class(&conn, original_document_id, class_id).format_err()
    }
}
