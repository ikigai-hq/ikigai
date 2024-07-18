pub mod assignment_mutation;
pub mod assignment_query;

pub use assignment_mutation::*;
pub use assignment_query::*;

use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};
use itertools::Itertools;
use uuid::Uuid;

use crate::authorization::DocumentActionPermission;
use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::graphql::data_loader::{
    AssignmentById, DocumentById, FindPageByDocumentId, FindPageContentByPageId, IkigaiDataLoader,
    SubmissionByAssignmentId,
};
use crate::helper::{
    document_quick_authorize, get_conn_from_ctx, get_public_user_from_loader,
    get_user_auth_from_ctx, get_user_id_from_ctx,
};

#[ComplexObject]
impl Assignment {
    async fn submissions(&self, ctx: &Context<'_>) -> Result<Vec<Submission>> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let submissions = loader
            .load_one(SubmissionByAssignmentId(self.id))
            .await?
            .unwrap_or_default();

        if document_quick_authorize(
            ctx,
            self.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await
        .is_ok()
        {
            Ok(submissions)
        } else if let Ok(user_id) = get_user_id_from_ctx(ctx).await {
            Ok(submissions
                .into_iter()
                .filter(|submission| submission.user_id == user_id)
                .sorted_by(|a, b| b.attempt_number.cmp(&a.attempt_number))
                .collect())
        } else {
            Ok(vec![])
        }
    }

    async fn document(&self, ctx: &Context<'_>) -> Result<Document> {
        get_document(ctx, self.document_id).await
    }

    async fn band_score(&self, ctx: &Context<'_>) -> Result<Option<BandScore>> {
        if let Some(band_score_id) = self.band_score_id {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let band_score = BandScore::find(&mut conn, band_score_id).format_err()?;
            Ok(Some(band_score))
        } else {
            Ok(None)
        }
    }

    async fn rubric(&self, ctx: &Context<'_>) -> Result<Option<Rubric>> {
        if let Some(rubric_id) = self.grade_by_rubric_id {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let rubric = Rubric::find_by_id(&mut conn, rubric_id).format_err()?;
            Ok(Some(rubric))
        } else {
            Ok(None)
        }
    }

    async fn total_quiz(&self, ctx: &Context<'_>) -> Result<usize> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let pages = loader
            .load_one(FindPageByDocumentId {
                document_id: self.document_id,
            })
            .await?
            .unwrap_or_default();
        let keys: Vec<FindPageContentByPageId> = pages
            .iter()
            .map(|page| FindPageContentByPageId { page_id: page.id })
            .collect();
        let page_contents = loader.load_many(keys).await?;
        let total_quiz = page_contents
            .into_values()
            .flatten()
            .map(|page_content| {
                serde_json::from_value::<JSONContent>(page_content.body).unwrap_or_default()
            })
            .map(|content| content.find_quiz_blocks().len())
            .sum();

        Ok(total_quiz)
    }
}

#[ComplexObject]
impl Submission {
    async fn status(&self) -> SubmissionStatus {
        self.submission_status()
    }

    async fn user(&self, ctx: &Context<'_>) -> Result<PublicUser> {
        get_public_user_from_loader(ctx, self.user_id).await
    }

    async fn assignment(&self, ctx: &Context<'_>) -> Result<Assignment> {
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let assignment = loader
            .load_one(AssignmentById(self.assignment_id))
            .await?
            .ok_or(format!("Not found assignment {}", self.assignment_id))?;
        Ok(assignment)
    }

    async fn document(&self, ctx: &Context<'_>) -> Result<Document> {
        get_document(ctx, self.document_id).await
    }

    async fn is_submitted(&self) -> bool {
        self.submit_at.is_some()
    }

    async fn rubric_grade(&self, ctx: &Context<'_>) -> Result<Option<RubricSubmission>> {
        let mut conn = get_conn_from_ctx(ctx).await?;
        RubricSubmission::find_by_submission_opt(&mut conn, self.id).format_err()
    }

    async fn grade(&self, ctx: &Context<'_>) -> Option<f64> {
        let user_auth = get_user_auth_from_ctx(ctx).await.ok()?;
        if user_auth.role != Role::Student {
            return self.auto_grade;
        }

        if self.allow_for_student_view_answer {
            self.auto_grade
        } else {
            None
        }
    }

    async fn final_grade(&self, ctx: &Context<'_>) -> Option<f64> {
        let user_auth = get_user_auth_from_ctx(ctx).await.ok()?;
        if user_auth.role != Role::Student {
            return self.final_grade;
        }

        if self.allow_for_student_view_answer {
            self.final_grade
        } else {
            None
        }
    }
}

#[ComplexObject]
impl RubricTableData {
    async fn total_user_score(&self) -> f64 {
        self.total_rubric_score()
    }
}

async fn get_document(ctx: &Context<'_>, document_id: Uuid) -> Result<Document> {
    let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
    let document = loader
        .load_one(DocumentById(document_id))
        .await?
        .ok_or(format!("Cannot found document {document_id}"))?;
    Ok(document)
}
