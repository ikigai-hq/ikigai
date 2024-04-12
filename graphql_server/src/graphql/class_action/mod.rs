pub mod class_mutation;
pub mod class_query;

pub use class_mutation::*;
pub use class_query::*;

use crate::authorization::ClassActionPermission;
use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};
use diesel::Connection;
use serde_json::json;

use crate::db::*;
use crate::error::{OpenExamError, OpenExamErrorExt};
use crate::graphql::data_loader::{
    ClassById, DocumentById, FileById, MembersByClassId, OpenExamDataLoader,
};
use crate::helper::{
    class_quick_authorize, get_conn_from_ctx, get_public_user_from_loader, get_user_id_from_ctx,
};

#[ComplexObject]
impl Class {
    async fn creator(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.creator_id).await
    }

    async fn banner(&self, ctx: &Context<'_>) -> Option<File> {
        if let Some(banner_id) = self.banner_id {
            let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
            loader.load_one(FileById(banner_id)).await.ok().flatten()
        } else {
            None
        }
    }

    async fn members(&self, ctx: &Context<'_>) -> Result<Vec<Member>> {
        if class_quick_authorize(ctx, self.id, ClassActionPermission::ManageClassMember)
            .await
            .is_ok()
        {
            let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
            let students = loader
                .load_one(MembersByClassId(self.id))
                .await?
                .unwrap_or_default();
            Ok(students)
        } else {
            Ok(vec![])
        }
    }

    async fn starter_document(&self, ctx: &Context<'_>) -> Result<ClassDocument> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        class_quick_authorize(ctx, self.id, ClassActionPermission::ViewClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        if let Some(starter_doc) =
            ClassDocument::find_starter_by_class(&conn, self.id).format_err()?
        {
            Ok(starter_doc)
        } else {
            conn.transaction::<_, OpenExamError, _>(|| {
                let starter_doc = Document::new(
                    user_id,
                    "".into(),
                    format!("{} start page", self.name),
                    self.org_id,
                    None,
                    0,
                    None,
                    HideRule::Public,
                    json!({
                        "style": "Default",
                        "size": "Default",
                        "width": "Standard",
                    }),
                );
                let starter_doc = Document::upsert(&conn, starter_doc)?;
                let class_doc = ClassDocument::new(self.id, starter_doc.id);

                let item = ClassDocument::upsert(&conn, class_doc)?;
                Ok(item)
            })
            .format_err()
        }
    }

    async fn class_documents(&self, ctx: &Context<'_>) -> Result<Vec<ClassDocument>> {
        class_quick_authorize(ctx, self.id, ClassActionPermission::ViewClassContent).await?;

        let conn = get_conn_from_ctx(ctx).await?;
        let class_documents = ClassDocument::find_all_by_class(&conn, self.id).format_err()?;
        Ok(class_documents)
    }
}

#[ComplexObject]
impl Member {
    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.user_id).await
    }

    async fn class(&self, ctx: &Context<'_>) -> Result<Class> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let class = loader
            .load_one(ClassById(self.class_id))
            .await?
            .ok_or(format!("Not found class {}", self.class_id))?;
        Ok(class)
    }
}

#[ComplexObject]
impl ClassDocument {
    async fn document(&self, ctx: &Context<'_>) -> Result<Document> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let document = loader
            .load_one(DocumentById(self.document_id))
            .await?
            .ok_or(format!("Cannot found the document {}", self.document_id))?;

        Ok(document)
    }

    async fn class(&self, ctx: &Context<'_>) -> Result<Class> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let document = loader
            .load_one(ClassById(self.class_id))
            .await?
            .ok_or(format!("Cannot found the class {}", self.class_id))?;

        Ok(document)
    }
}
