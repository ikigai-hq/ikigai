use async_graphql::*;
use diesel::Connection;
use itertools::Itertools;
use uuid::Uuid;

use crate::authorization::{DocumentActionPermission, SpaceActionPermission};
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
        data.visibility = if is_assignment {
            DocumentVisibility::Private
        } else {
            DocumentVisibility::Public
        };

        let mut conn = get_conn_from_ctx(ctx).await?;
        let doc = conn
            .transaction::<_, IkigaiError, _>(|conn| {
                if let Some(space_id) = data.space_id {
                    data.index = Document::find_lowest_index_of_space(conn, space_id)?;
                }
                let doc = Document::upsert(conn, data)?;
                if is_assignment {
                    let new_assignment = NewAssignment::init(doc.id);
                    Assignment::insert(conn, new_assignment)?;
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
        let mut conn = get_conn_from_ctx(ctx).await?;
        Document::update(&mut conn, document_id, data).format_err()?;

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

        let mut conn = get_conn_from_ctx(ctx).await?;
        Document::update_positions(&mut conn, items).format_err()?;

        Ok(true)
    }

    async fn document_restore(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        Document::soft_delete_by_ids(&mut conn, vec![document_id], None).format_err()?;

        Ok(true)
    }

    async fn document_soft_delete(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
        include_children: bool,
    ) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        delete_document(&mut conn, document_id, include_children).format_err()?;

        Ok(true)
    }

    async fn document_delete(&self, ctx: &Context<'_>, document_id: Uuid) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        Document::delete(&mut conn, document_id).format_err()?;

        Ok(true)
    }

    async fn document_add_or_update_page(
        &self,
        ctx: &Context<'_>,
        mut page: Page,
        is_single_page: Option<bool>,
    ) -> Result<Page> {
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;
        let user_id = get_user_id_from_ctx(ctx).await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let existing_page = Page::find(&mut conn, page.id);
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
            .transaction::<_, IkigaiError, _>(|conn| {
                let page = Page::upsert(conn, page)?;
                if !page_is_existing {
                    let page_content = PageContent {
                        id: Uuid::new_v4(),
                        page_id: page.id,
                        index: 1,
                        body: "".into(),
                        updated_at: get_now_as_secs(),
                        created_at: get_now_as_secs(),
                    };
                    PageContent::upsert(conn, page_content)?;

                    if is_single_page != Some(true) {
                        let page_content = PageContent {
                            id: Uuid::new_v4(),
                            page_id: page.id,
                            index: 2,
                            body: "".into(),
                            updated_at: get_now_as_secs(),
                            created_at: get_now_as_secs(),
                        };
                        PageContent::upsert(conn, page_content)?;
                    }
                }
                Ok(page)
            })
            .format_err()?;
        Ok(page)
    }

    async fn document_remove_page(&self, ctx: &Context<'_>, page_id: Uuid) -> Result<bool> {
        let page = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Page::find(&mut conn, page_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        Page::soft_delete(&mut conn, page_id).format_err()?;

        Ok(true)
    }

    async fn document_restore_page(&self, ctx: &Context<'_>, page_id: Uuid) -> Result<Page> {
        let page = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Page::find(&mut conn, page_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let page = Page::restore(&mut conn, page_id).format_err()?;

        Ok(page)
    }

    async fn document_add_or_update_page_content(
        &self,
        ctx: &Context<'_>,
        page_content: PageContent,
    ) -> Result<PageContent> {
        let page = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Page::find(&mut conn, page_content.page_id).format_err()?
        };
        document_quick_authorize(
            ctx,
            page.document_id,
            DocumentActionPermission::EditDocument,
        )
        .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let existing_page_content = PageContent::find(&mut conn, page_content.id);
        if existing_page_content.map(|content| content.page_id) != Ok(page.id) {
            return Err(IkigaiError::new_bad_request(
                "Cannot update content of other page",
            ))
            .format_err();
        }

        let content = PageContent::upsert(&mut conn, page_content).format_err()?;
        Ok(content)
    }

    async fn document_assign(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
        emails: Vec<String>,
    ) -> Result<bool> {
        let document = {
            let mut conn = get_conn_from_ctx(ctx).await?;
            Document::find_by_id(&mut conn, document_id).format_err()?
        };

        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        if let Some(space_id) = document.space_id {
            space_quick_authorize(ctx, space_id, SpaceActionPermission::ManageSpaceMember).await?;
        } else {
            return Err(IkigaiError::new_bad_request(
                "Cannot assign non space assignment",
            ))
            .format_err();
        }

        let space_id = document.space_id.unwrap();
        let mut conn = get_conn_from_ctx(ctx).await?;
        let space_members = conn
            .transaction::<_, IkigaiError, _>(|conn| {
                let mut students = vec![];
                let mut new_users = vec![];
                for email in emails {
                    if let Some(user) = User::find_by_email_opt(conn, &email)? {
                        students.push(user);
                    } else {
                        new_users.push(NewUser::new(email.clone(), email, "".into()));
                    };
                }
                students.append(&mut User::batch_insert(conn, new_users)?);

                let space_members = students
                    .iter()
                    .map(|student| SpaceMember::new(space_id, student.id, None, Role::Student))
                    .collect();
                let space_members: Vec<SpaceMember> =
                    SpaceMember::batch_upsert(conn, space_members)?
                        .into_iter()
                        .filter(|member| member.role == Role::Student)
                        .collect();

                let assigned_users = space_members
                    .iter()
                    .map(|member| DocumentAssignedUsers::new(document_id, member.user_id))
                    .collect();

                DocumentAssignedUsers::batch_upsert(conn, assigned_users)?;

                Ok(space_members)
            })
            .format_err()?;

        let notification =
            Notification::new_assign_to_assignment_notification(AssignToAssignmentContext {
                assignment_document_id: document_id,
                assignment_name: document.title,
            });
        let notification = Notification::insert(&mut conn, notification).format_err()?;
        send_notification(
            &mut conn,
            notification,
            space_members.iter().map(|member| member.user_id).collect(),
        )
        .format_err()?;

        Ok(true)
    }

    async fn document_remove_assignee(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
        user_id: i32,
    ) -> Result<bool> {
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        DocumentAssignedUsers::remove(&mut conn, document_id, user_id).format_err()?;

        Ok(true)
    }

    async fn document_add_tag(&self, ctx: &Context<'_>, tag: DocumentTag) -> Result<DocumentTag> {
        document_quick_authorize(
            ctx,
            tag.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        let tag = DocumentTag::upsert(&mut conn, tag).format_err()?;

        Ok(tag)
    }

    async fn document_remove_tag(&self, ctx: &Context<'_>, tag: DocumentTag) -> Result<bool> {
        document_quick_authorize(
            ctx,
            tag.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await?;

        let mut conn = get_conn_from_ctx(ctx).await?;
        DocumentTag::delete(&mut conn, tag.document_id, tag.tag).format_err()?;

        Ok(true)
    }
}
