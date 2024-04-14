pub mod quiz_mutation;
pub mod quiz_query;

pub use quiz_mutation::*;
pub use quiz_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::*;

use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::graphql::data_loader::{
    AnswersByQuiz, FindPublicUserById, OpenExamDataLoader, QuizAnswerByUser, QuizId,
    QuizStructureById,
};
use crate::helper::{document_quick_authorize, get_user_id_from_ctx};

#[ComplexObject]
impl Quiz {
    async fn structure(&self, ctx: &Context<'_>) -> Result<QuizStructure> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let quiz_structure = loader
            .load_one(QuizStructureById(self.quiz_structure_id))
            .await?
            .ok_or("Not found quiz structure")?;
        Ok(quiz_structure)
    }

    async fn structure_answer(&self, ctx: &Context<'_>) -> Result<serde_json::Value> {
        if document_quick_authorize(ctx, self.document_id, DocumentActionPermission::ViewAnswer)
            .await
            .is_err()
        {
            return Ok(serde_json::Value::Null);
        }

        let structure = self.structure(ctx).await?;
        Ok(structure.quiz_answer)
    }

    async fn structure_explanation(&self, ctx: &Context<'_>) -> Result<String> {
        if document_quick_authorize(ctx, self.document_id, DocumentActionPermission::ViewAnswer)
            .await
            .is_err()
        {
            return Ok("".into());
        }

        let structure = self.structure(ctx).await?;
        Ok(structure.explanation)
    }

    async fn my_answer(&self, ctx: &Context<'_>) -> Result<Option<QuizAnswer>> {
        if let Ok(user_id) = get_user_id_from_ctx(ctx).await {
            let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
            Ok(loader
                .load_one(QuizAnswerByUser {
                    user_id,
                    quiz_id: self.id,
                })
                .await?)
        } else {
            Ok(None)
        }
    }

    async fn answers(&self, ctx: &Context<'_>) -> Result<Vec<QuizAnswer>> {
        if document_quick_authorize(
            ctx,
            self.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await
        .is_err()
        {
            return Ok(vec![]);
        }

        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let answers = loader
            .load_one(AnswersByQuiz(self.id))
            .await?
            .unwrap_or_default();
        Ok(answers)
    }
}

#[ComplexObject]
impl QuizAnswer {
    async fn is_correct(&self, ctx: &Context<'_>) -> Result<Option<bool>> {
        Ok(self.score(ctx).await?.map(|score| score != 0.0))
    }

    async fn score(&self, ctx: &Context<'_>) -> Result<Option<f64>> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let quiz = loader
            .load_one(QuizId(self.quiz_id))
            .await?
            .ok_or(format!("Cannot find quiz {}", self.quiz_id))?;
        if document_quick_authorize(ctx, quiz.document_id, DocumentActionPermission::ViewAnswer)
            .await
            .is_ok()
        {
            Ok(Some(self.score))
        } else {
            Ok(None)
        }
    }

    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        let loader = ctx.data_unchecked::<DataLoader<OpenExamDataLoader>>();
        let user = loader
            .load_one(FindPublicUserById(self.user_id))
            .await?
            .ok_or(format!("Cannot find user {}", self.user_id))?;
        Ok(user)
    }
}
