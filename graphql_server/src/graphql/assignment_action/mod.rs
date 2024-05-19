pub mod assignment_mutation;
pub mod assignment_query;

pub use assignment_mutation::*;
pub use assignment_query::*;

use std::collections::HashMap;

use crate::authorization::DocumentActionPermission;
use async_graphql::dataloader::DataLoader;
use async_graphql::{ComplexObject, Context, Result};
use itertools::Itertools;
use uuid::Uuid;

use crate::db::*;
use crate::error::IkigaiErrorExt;
use crate::graphql::data_loader::{
    AssignmentById, DocumentById, IkigaiDataLoader, SubmissionByAssignmentId,
};
use crate::helper::{
    document_quick_authorize, get_conn_from_ctx, get_public_user_from_loader,
    get_user_auth_from_ctx, get_user_id_from_ctx,
};

#[ComplexObject]
impl Assignment {
    async fn submissions(&self, ctx: &Context<'_>) -> Result<Vec<Submission>> {
        if document_quick_authorize(
            ctx,
            self.document_id,
            DocumentActionPermission::ManageDocument,
        )
        .await
        .is_ok()
        {
            let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
            let submissions = loader
                .load_one(SubmissionByAssignmentId(self.id))
                .await?
                .unwrap_or_default();

            let mut unique_submissions: HashMap<i32, Submission> = HashMap::new();
            for submission in submissions {
                let key = submission.user_id;
                if let Some(current_submission) = unique_submissions.get_mut(&key) {
                    if current_submission.attempt_number < submission.attempt_number {
                        *current_submission = submission;
                    }
                } else {
                    unique_submissions.insert(key, submission);
                }
            }

            Ok(unique_submissions.into_iter().map(|i| i.1).collect())
        } else {
            Ok(vec![])
        }
    }

    // TODO: Deprecated, should remove in the future
    async fn my_submission(&self, ctx: &Context<'_>) -> Result<Option<Submission>> {
        let user_id = get_user_id_from_ctx(ctx).await?;
        let loader = ctx.data_unchecked::<DataLoader<IkigaiDataLoader>>();
        let submissions = loader
            .load_one(SubmissionByAssignmentId(self.id))
            .await?
            .unwrap_or_default();

        let submission = submissions
            .into_iter()
            .sorted_by(|a, b| Ord::cmp(&b.attempt_number, &a.attempt_number))
            .find(|s| s.user_id == user_id);

        Ok(submission)
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
        if self.grade_method != GradeMethod::Rubric {
            return Ok(None);
        }

        if let Some(rubric_id) = self.grade_by_rubric_id {
            let mut conn = get_conn_from_ctx(ctx).await?;
            let rubric = Rubric::find_by_id(&mut conn, rubric_id).format_err()?;
            Ok(Some(rubric))
        } else {
            Ok(None)
        }
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
