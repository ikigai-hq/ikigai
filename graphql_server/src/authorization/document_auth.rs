use diesel::PgConnection;
use oso::PolarClass;
use std::fmt::{Display, Formatter};
use uuid::Uuid;

use crate::db::*;
use crate::error::OpenExamError;

#[derive(PolarClass, Clone)]
pub struct DocumentAuth {
    #[polar(attribute)]
    pub id: Uuid,
    #[polar(attribute)]
    pub creator_id: i32,
    #[polar(attribute)]
    pub org_id: i32,
    #[polar(attribute)]
    pub allow_for_student_view_answer: bool,
    #[polar(attribute)]
    pub is_public: bool,
    #[polar(attribute)]
    pub is_doing_submission: bool,
    #[polar(attribute)]
    pub is_doing_open_type_submission: bool,
}

impl DocumentAuth {
    pub fn try_new(conn: &PgConnection, document_id: Uuid) -> Result<Self, OpenExamError> {
        let mut allow_for_student_view_answer = false;
        let mut is_doing_submission = false;
        let mut is_doing_open_type_submission = false;

        let document = Document::find_by_id(conn, document_id)?;
        let submission = Submission::find_by_document(conn, document_id)?;

        if let Some(submission) = &submission {
            allow_for_student_view_answer = submission.allow_for_student_view_answer;
            is_doing_submission = submission.submit_at.is_none();
            is_doing_open_type_submission = is_doing_submission && submission.can_change_structure;
        }

        Ok(Self {
            id: document_id,
            creator_id: document.creator_id,
            org_id: document.org_id,
            is_public: document.is_public,
            allow_for_student_view_answer,
            is_doing_submission,
            is_doing_open_type_submission,
        })
    }
}

#[derive(Enum, Debug, Copy, Clone, Eq, PartialEq)]
pub enum DocumentActionPermission {
    ViewDocument,
    InteractiveWithTool,
    ViewAnswer,
    EditDocument,
    ManageDocument,
}

impl Display for DocumentActionPermission {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let permission = match self {
            Self::ViewDocument => "view_document",
            Self::InteractiveWithTool => "interactive_with_tool",
            Self::ViewAnswer => "view_answer",
            Self::EditDocument => "edit_document",
            Self::ManageDocument => "manage_document",
        };
        write!(f, "{permission}")
    }
}
