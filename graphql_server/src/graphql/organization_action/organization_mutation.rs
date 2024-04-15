use crate::authorization::{DocumentActionPermission, OrganizationActionPermission};
use async_graphql::*;
use diesel::Connection;
use uuid::Uuid;

use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::helper::{
    document_quick_authorize, get_conn_from_ctx, get_user_auth_from_ctx, get_user_id_from_ctx,
    organization_authorize, DocumentCloneConfig,
};

#[derive(Default)]
pub struct OrganizationMutation;

#[Object]
impl OrganizationMutation {
    async fn org_update(
        &self,
        ctx: &Context<'_>,
        org_id: i32,
        data: UpdateOrganizationData,
    ) -> Result<Organization> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            org_id,
            OrganizationActionPermission::ManageOrgInformation,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let org = Organization::update(&conn, org_id, data).format_err()?;
        Ok(org)
    }

    async fn org_remove_org_member(&self, ctx: &Context<'_>, user_id: i32) -> Result<bool> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::RemoveOrgMember,
        )
        .await?;

        if user_auth.id == user_id {
            return Err(OpenExamError::new_bad_request("Cannot remove yourself!")).format_err();
        }

        let conn = get_conn_from_ctx(ctx).await?;
        let org_member = OrganizationMember::find(&conn, user_auth.org_id, user_id).format_err()?;
        if org_member.org_id != user_auth.org_id {
            return Err(OpenExamError::new_bad_request(
                "Cannot remove account of another org!",
            ))
            .format_err();
        }

        let org = Organization::find(&conn, user_auth.org_id).format_err()?;
        if org.owner_id == Some(user_id) {
            return Err(OpenExamError::new_bad_request(
                "Cannot remove owner of organization!",
            ))
            .format_err();
        }

        conn.transaction::<_, OpenExamError, _>(|| {
            OrganizationMember::remove(&conn, user_auth.org_id, user_id)?;
            SpaceMember::remove_by_user(&conn, user_id)?;
            Ok(())
        })
        .format_err()?;

        Ok(true)
    }

    async fn org_upsert_rubric(&self, ctx: &Context<'_>, rubric: Rubric) -> Result<Rubric> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            rubric.org_id,
            OrganizationActionPermission::ManageOrgInformation,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let rubric = Rubric::upsert(&conn, rubric).format_err()?;

        Ok(rubric)
    }

    async fn org_remove_rubric(&self, ctx: &Context<'_>, rubric_id: Uuid) -> Result<bool> {
        let rubric = {
            let conn = get_conn_from_ctx(ctx).await?;
            Rubric::find_by_id(&conn, rubric_id).format_err()?
        };

        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            rubric.org_id,
            OrganizationActionPermission::ManageOrgInformation,
        )
        .await?;
        let conn = get_conn_from_ctx(ctx).await?;
        Rubric::remove(&conn, rubric.id).format_err()?;

        Ok(true)
    }

    async fn org_add_template(
        &self,
        ctx: &Context<'_>,
        document_id: Uuid,
    ) -> Result<DocumentTemplate> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;
        document_quick_authorize(ctx, document_id, DocumentActionPermission::ManageDocument)
            .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let document = Document::find_by_id(&conn, document_id).format_err()?;

        let template = conn
            .transaction::<_, OpenExamError, _>(|| {
                // Step 1: Clone new document
                let mut config = DocumentCloneConfig::new("", true);
                config.org_id = Some(user_auth.org_id);
                let new_document = document.deep_clone(
                    &conn,
                    user_auth.id,
                    config,
                    None,
                    false,
                    None,
                    true,
                )?;

                // Step 2: Create template with new document
                let template = DocumentTemplate::new(
                    new_document.title,
                    new_document.id,
                    user_auth.org_id,
                    user_auth.id,
                );
                let template = DocumentTemplate::upsert(&conn, template)?;
                Ok(template)
            })
            .format_err()?;

        Ok(template)
    }

    async fn org_update_template(
        &self,
        ctx: &Context<'_>,
        template: DocumentTemplate,
    ) -> Result<DocumentTemplate> {
        let current_template = {
            let conn = get_conn_from_ctx(ctx).await?;
            DocumentTemplate::find(&conn, template.id).format_err()?
        };
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            current_template.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let template = DocumentTemplate::upsert(&conn, template).format_err()?;
        Ok(template)
    }

    async fn org_delete_document_template(
        &self,
        ctx: &Context<'_>,
        template_id: Uuid,
    ) -> Result<bool> {
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
        DocumentTemplate::delete(&conn, template_id).format_err()?;

        Ok(true)
    }

    async fn org_add_template_category(
        &self,
        ctx: &Context<'_>,
        category: String,
    ) -> Result<Category> {
        let user_auth = get_user_auth_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_auth.id,
            user_auth.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let last_index = Category::find_last_org_internal_index(&conn, user_auth.org_id);
        let category = Category::new(category, user_auth.org_id, last_index);
        let category = Category::upsert(&conn, category).format_err()?;

        Ok(category)
    }

    async fn org_update_template_category(
        &self,
        ctx: &Context<'_>,
        category: Category,
    ) -> Result<Category> {
        let original_category = {
            let conn = get_conn_from_ctx(ctx).await?;
            Category::find(&conn, category.id).format_err()?
        };

        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            original_category.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let category = Category::upsert(&conn, category).format_err()?;
        Ok(category)
    }

    async fn org_delete_category(&self, ctx: &Context<'_>, category_id: Uuid) -> Result<bool> {
        let category = {
            let conn = get_conn_from_ctx(ctx).await?;
            Category::find(&conn, category_id).format_err()?
        };

        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            category.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        Category::delete(&conn, category_id).format_err()?;
        Ok(true)
    }

    async fn org_add_category_tag(
        &self,
        ctx: &Context<'_>,
        category_tag: CategoryTag,
    ) -> Result<CategoryTag> {
        let category = {
            let conn = get_conn_from_ctx(ctx).await?;
            Category::find(&conn, category_tag.category_id).format_err()?
        };

        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            category.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let tag = Tag::new(category_tag.tag.clone(), category.org_id);
        Tag::upsert(&conn, tag).format_err()?;
        let tag = CategoryTag::insert(&conn, category_tag).format_err()?;
        Ok(tag)
    }

    async fn org_delete_category_tag(
        &self,
        ctx: &Context<'_>,
        category_tag: CategoryTag,
    ) -> Result<bool> {
        let category = {
            let conn = get_conn_from_ctx(ctx).await?;
            Category::find(&conn, category_tag.category_id).format_err()?
        };

        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            category.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        CategoryTag::delete(&conn, category_tag).format_err()?;
        Ok(true)
    }

    async fn org_add_template_tag(
        &self,
        ctx: &Context<'_>,
        template_tag: DocumentTemplateTag,
    ) -> Result<DocumentTemplateTag> {
        let template = {
            let conn = get_conn_from_ctx(ctx).await?;
            DocumentTemplate::find(&conn, template_tag.document_template_id).format_err()?
        };
        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            template.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let tag = Tag::new(template_tag.tag.clone(), template.org_id);
        Tag::upsert(&conn, tag).format_err()?;
        let template_tag = DocumentTemplateTag::upsert(&conn, template_tag).format_err()?;
        Ok(template_tag)
    }

    async fn org_delete_template_tag(
        &self,
        ctx: &Context<'_>,
        template_tag: DocumentTemplateTag,
    ) -> Result<bool> {
        let template = {
            let conn = get_conn_from_ctx(ctx).await?;
            DocumentTemplate::find(&conn, template_tag.document_template_id).format_err()?
        };
        let user_id = get_user_id_from_ctx(ctx).await?;
        organization_authorize(
            ctx,
            user_id,
            template.org_id,
            OrganizationActionPermission::ManageTemplate,
        )
        .await?;

        let conn = get_conn_from_ctx(ctx).await?;
        DocumentTemplateTag::delete(&conn, template_tag).format_err()?;
        Ok(true)
    }
}
