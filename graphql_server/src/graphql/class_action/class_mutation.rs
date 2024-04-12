use crate::authorization::{ClassActionPermission, OrganizationActionPermission};
use async_graphql::*;
use diesel::{Connection, PgConnection};
use uuid::Uuid;

use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::helper::*;
use crate::util::get_now_as_secs;

#[derive(Default)]
pub struct ClassMutation;

#[Object]
impl ClassMutation {
    async fn class_create(&self, ctx: &Context<'_>, mut data: NewClass) -> Result<Class> {
        let user = get_user_from_ctx(ctx).await?;
        let member = get_org_member_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user.id,
            member.org_id,
            OrganizationActionPermission::AddClass,
        )
        .await?;

        data.creator_id = user.id;
        data.org_id = member.org_id;
        let conn = get_conn_from_ctx(ctx).await?;

        Class::insert(&conn, data).format_err()
    }

    async fn class_duplicate(&self, ctx: &Context<'_>, class_id: i32) -> Result<Class> {
        let member = get_org_member_from_ctx(ctx).await?;
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let new_class =
            duplicate_class(&conn, class_id, member.org_id, member.user_id).format_err()?;
        Ok(new_class)
    }

    async fn class_update(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        data: UpdateClassData,
    ) -> Result<bool> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Class::update(&conn, class_id, data).format_err()?;
        Ok(true)
    }

    async fn class_restore(&self, ctx: &Context<'_>, class_id: i32) -> Result<Class> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let class = Class::restore(&conn, class_id).format_err()?;
        Ok(class)
    }

    async fn class_soft_delete(&self, ctx: &Context<'_>, class_id: i32) -> Result<bool> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Class::soft_remove(&conn, class_id).format_err()?;
        Ok(true)
    }

    async fn class_delete(&self, ctx: &Context<'_>, class_id: i32) -> Result<bool> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassSetting).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Class::remove(&conn, class_id).format_err()?;
        Ok(true)
    }

    async fn class_add_document(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        document_id: Uuid,
        is_assignment: bool,
    ) -> Result<ClassDocument> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let class_doc = conn
            .transaction::<_, OpenExamError, _>(|| {
                if is_assignment {
                    let new_assignment = NewAssignment::init(document_id);
                    Assignment::insert(&conn, new_assignment)?;
                }
                let class_doc = ClassDocument::new(class_id, document_id);
                let class_doc = ClassDocument::upsert(&conn, class_doc)?;
                Ok(class_doc)
            })
            .format_err()?;

        Ok(class_doc)
    }

    async fn class_duplicate_document(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        document_id: Uuid,
    ) -> Result<Vec<ClassDocument>> {
        let member = get_org_member_from_ctx(ctx).await?;
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;

        let original_document = Document::find_by_id(&conn, document_id).format_err()?;
        if original_document.deleted_at.is_some() {
            return Err(OpenExamError::new_bad_request(
                "Cannot duplicate deleted document!",
            ))
            .format_err();
        }
        let last_index =
            ClassDocument::get_last_index(&conn, class_id, original_document.parent_id)?;
        let mut config = DocumentCloneConfig::new("Copy of ", true);
        config.set_index(last_index);
        config.set_parent(original_document.parent_id);
        config.set_org(member.org_id);

        let doc = conn
            .transaction::<_, OpenExamError, _>(|| {
                original_document.deep_clone(
                    &conn,
                    member.user_id,
                    config,
                    Some(class_id),
                    true,
                    None,
                )
            })
            .format_err()?;

        get_all_class_documents(&conn, doc.id).format_err()
    }

    async fn class_remove_document(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        document_id: Uuid,
    ) -> Result<bool> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        ClassDocument::find_by_id(&conn, class_id, document_id).format_err()?;
        // It will cascade delete class document
        Document::delete(&conn, document_id).format_err()?;

        Ok(true)
    }

    async fn class_soft_delete_document(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        document_id: Uuid,
    ) -> Result<bool> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::soft_delete(&conn, document_id).format_err()?;

        Ok(true)
    }

    async fn class_soft_delete_multiple(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        document_ids: Vec<Uuid>,
    ) -> Result<bool> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let now = get_now_as_secs();
        Document::soft_delete_by_ids(&conn, document_ids, Some(now)).format_err()?;

        Ok(true)
    }

    async fn class_restore_soft_delete_document(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        document_ids: Vec<Uuid>,
    ) -> Result<bool> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Document::soft_delete_by_ids(&conn, document_ids, None).format_err()?;
        Ok(true)
    }

    async fn class_add_member(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        user_id: i32,
    ) -> Result<Member> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassMember).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let class = Class::find_by_id(&conn, class_id).format_err()?;
        add_class_member(&conn, &class, user_id)
    }

    async fn class_add_members(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        user_ids: Vec<i32>,
    ) -> Result<Vec<Member>> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassMember).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let class = Class::find_by_id(&conn, class_id).format_err()?;
        let mut members = vec![];
        for user_id in user_ids {
            if let Ok(member) = add_class_member(&conn, &class, user_id) {
                members.push(member);
            }
        }

        Ok(members)
    }

    async fn class_remove_member(
        &self,
        ctx: &Context<'_>,
        class_id: i32,
        user_id: i32,
    ) -> Result<bool> {
        class_quick_authorize(ctx, class_id, ClassActionPermission::ManageClassMember).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Member::find(&conn, class_id, user_id).format_err()?;
        Member::remove(&conn, class_id, user_id).format_err()?;

        Ok(true)
    }
}

fn add_class_member(conn: &PgConnection, class: &Class, user_id: i32) -> Result<Member> {
    OrganizationMember::find(conn, class.org_id, user_id).format_err()?;
    let new_member = Member::new(class.id, user_id);
    let new_member = Member::upsert(conn, new_member).format_err()?;

    Ok(new_member)
}
