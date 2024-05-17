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
        emails: Vec<String>,
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

        let space_id = document.space_id.unwrap();
        let space = Space::find_by_id(&conn, space_id).format_err()?;
        let (items, notification, user_ids) = conn
            .transaction::<_, IkigaiError, _>(|| {
                let mut current_users = User::find_by_emails(&conn, &emails)?;
                let new_users: Vec<NewUser> = emails
                    .into_iter()
                    .filter(|email| !current_users.iter().map(|c| &c.email).contains(email))
                    .map(|email| NewUser::new(email.clone(), email, "".into()))
                    .collect();
                let mut new_users = User::batch_insert(&conn, new_users)?;
                current_users.append(&mut new_users);

                for user in current_users.iter() {
                    add_space_member(&conn, &space, user.id, None, Role::Student)?;
                }

                let user_ids: Vec<i32> = current_users.iter().map(|u| u.id).unique().collect();
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

                Ok((items, notification, user_ids))
            })
            .format_err()?;

        send_notification(&conn, notification, user_ids)?;

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

    async fn document_add_or_update_page(&self, ctx: &Context<'_>, mut page: Page) -> Result<Page> {
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;
        let user_id = get_user_id_from_ctx(ctx).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let existing_page = Page::find(&conn, page.id);
        let page_is_existing = existing_page.is_ok();
        if existing_page.is_ok()
            && existing_page.map(|page| page.document_id) != Ok(page.document_id)
        {
            return Err(IkigaiError::new_bad_request(
                "Cannot update page of other document",
            ))
            .format_err()?;
        }

        page.created_by_id = user_id;

        let page = conn
            .transaction::<_, IkigaiError, _>(|| {
                let page = Page::upsert(&conn, page)?;
                if !page_is_existing {
                    let page_content = PageContent {
                        id: Uuid::new_v4(),
                        page_id: page.id,
                        index: 1,
                        body: "".into(),
                        updated_at: get_now_as_secs(),
                        created_at: get_now_as_secs(),
                    };
                    PageContent::upsert(&conn, page_content)?;

                    let page_content = PageContent {
                        id: Uuid::new_v4(),
                        page_id: page.id,
                        index: 2,
                        body: "".into(),
                        updated_at: get_now_as_secs(),
                        created_at: get_now_as_secs(),
                    };
                    PageContent::upsert(&conn, page_content)?;
                }
                Ok(page)
            })
            .format_err()?;
        Ok(page)
    }

    async fn document_remove_page(&self, ctx: &Context<'_>, page_id: Uuid) -> Result<bool> {
        let page = {
            let conn = get_conn_from_ctx(ctx).await?;
            Page::find(&conn, page_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Page::soft_delete(&conn, page_id).format_err()?;

        Ok(true)
    }

    async fn document_restore_page(&self, ctx: &Context<'_>, page_id: Uuid) -> Result<Page> {
        let page = {
            let conn = get_conn_from_ctx(ctx).await?;
            Page::find(&conn, page_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let page = Page::restore(&conn, page_id).format_err()?;

        Ok(page)
    }

    async fn document_add_or_update_page_content(
        &self,
        ctx: &Context<'_>,
        page_content: PageContent,
    ) -> Result<PageContent> {
        let page = {
            let conn = get_conn_from_ctx(ctx).await?;
            Page::find(&conn, page_content.page_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let existing_page_content = PageContent::find(&conn, page_content.id);
        if existing_page_content.map(|content| content.page_id) != Ok(page.id) {
            return Err(IkigaiError::new_bad_request(
                "Cannot update content of other page",
            ))
            .format_err();
        }

        let content = PageContent::upsert(&conn, page_content).format_err()?;
        Ok(content)
    }
}
