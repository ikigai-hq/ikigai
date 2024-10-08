use std::collections::HashMap;

use async_graphql::dataloader::*;
use async_graphql::*;
use itertools::Itertools;
use uuid::Uuid;

use crate::connection_pool::get_conn_from_actor;
use crate::db::*;

use crate::error::IkigaiError;

#[derive(Clone)]
pub struct IkigaiDataLoader;

/// Load User Info by user id
#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct FindPublicUserById(pub i32);

impl Loader<FindPublicUserById> for IkigaiDataLoader {
    type Value = PublicUser;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindPublicUserById],
    ) -> Result<HashMap<FindPublicUserById, PublicUser>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let ids = keys.iter().map(|u| u.0).collect();
        let users = User::find_by_ids(&mut conn, &ids)?;
        Ok(users
            .into_iter()
            .map(|user| (FindPublicUserById(user.id), PublicUser::from(user)))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct FindUserById(pub i32);

impl Loader<FindUserById> for IkigaiDataLoader {
    type Value = User;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindUserById],
    ) -> Result<HashMap<FindUserById, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let ids = keys.iter().map(|u| u.0).collect();
        let users = User::find_by_ids(&mut conn, &ids)?;
        Ok(users
            .into_iter()
            .map(|user| (FindUserById(user.id), user))
            .collect())
    }
}

/// Load File by File Id
#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct FileById(pub Uuid);

impl Loader<FileById> for IkigaiDataLoader {
    type Value = File;
    type Error = IkigaiError;

    async fn load(&self, keys: &[FileById]) -> Result<HashMap<FileById, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let file_ids = keys.iter().map(|k| k.0).collect::<Vec<Uuid>>();
        let res = File::find_all_by_ids(&mut conn, &file_ids)?;
        Ok(res.into_iter().map(|f| (FileById(f.uuid), f)).collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct MembersByClassId(pub i32);

impl Loader<MembersByClassId> for IkigaiDataLoader {
    type Value = Vec<SpaceMember>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[MembersByClassId],
    ) -> Result<HashMap<MembersByClassId, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let class_ids = keys.iter().map(|c| c.0).collect::<Vec<i32>>();
        let members = SpaceMember::find_all_by_classes(&mut conn, class_ids)?;

        let mut result: HashMap<MembersByClassId, Self::Value> = HashMap::new();
        for member in members {
            let id = MembersByClassId(member.space_id);
            if let Some(items) = result.get_mut(&id) {
                items.push(member);
            } else {
                result.insert(id, vec![member]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SpaceById(pub i32);

impl Loader<SpaceById> for IkigaiDataLoader {
    type Value = Space;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SpaceById],
    ) -> Result<HashMap<SpaceById, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let class_ids = keys.iter().map(|c| c.0).unique().collect::<Vec<i32>>();
        let res = Space::find_all_by_ids(&mut conn, class_ids)?;
        Ok(res.into_iter().map(|p| (SpaceById(p.id), p)).collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SpaceByDocumentId(pub Uuid);

impl Loader<SpaceByDocumentId> for IkigaiDataLoader {
    type Value = Space;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SpaceByDocumentId],
    ) -> std::result::Result<HashMap<SpaceByDocumentId, Self::Value>, Self::Error> {
        let document_ids = keys.iter().map(|i| i.0).unique().collect::<Vec<Uuid>>();
        let mut conn = get_conn_from_actor().await?;
        let documents = Document::find_by_ids(&mut conn, document_ids)?;
        let space_ids: Vec<i32> = documents
            .iter()
            .filter_map(|d| d.space_id)
            .unique()
            .collect();

        let spaces: HashMap<i32, Space> = Space::find_all_by_ids(&mut conn, space_ids)?
            .into_iter()
            .map(|c| (c.id, c))
            .collect();

        let mut res: HashMap<SpaceByDocumentId, Self::Value> = HashMap::new();
        for document in documents {
            if let Some(space_id) = document.space_id {
                let key = SpaceByDocumentId(document.id);
                if let Some(space) = spaces.get(&space_id) {
                    res.insert(key, space.clone());
                }
            }
        }

        Ok(res)
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SubmissionById(pub i32);

impl Loader<SubmissionById> for IkigaiDataLoader {
    type Value = Submission;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SubmissionById],
    ) -> std::result::Result<HashMap<SubmissionById, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let submission_ids = keys.iter().map(|c| c.0).collect();
        Ok(Submission::find_all_by_ids(&mut conn, submission_ids)?
            .into_iter()
            .map(|submission| (SubmissionById(submission.id), submission))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SubmissionByAssignmentId(pub i32);

impl Loader<SubmissionByAssignmentId> for IkigaiDataLoader {
    type Value = Vec<Submission>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SubmissionByAssignmentId],
    ) -> Result<HashMap<SubmissionByAssignmentId, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let assignment_ids = keys.iter().map(|c| c.0).collect();

        let mut result: HashMap<SubmissionByAssignmentId, Self::Value> = HashMap::new();
        for item in Submission::find_all_by_assignments(&mut conn, assignment_ids)? {
            let id = SubmissionByAssignmentId(item.assignment_id);
            if let Some(items) = result.get_mut(&id) {
                items.push(item);
            } else {
                result.insert(id, vec![item]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct AssignmentById(pub i32);

impl Loader<AssignmentById> for IkigaiDataLoader {
    type Value = Assignment;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[AssignmentById],
    ) -> Result<HashMap<AssignmentById, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let assignment_ids = keys.iter().map(|c| c.0).collect();

        Ok(Assignment::find_all_by_ids(&mut conn, assignment_ids)?
            .into_iter()
            .map(|i| (AssignmentById(i.id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct AssignmentByDocumentId(pub Uuid);

impl Loader<AssignmentByDocumentId> for IkigaiDataLoader {
    type Value = Assignment;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[AssignmentByDocumentId],
    ) -> Result<HashMap<AssignmentByDocumentId, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let document_ids = keys.iter().map(|c| c.0).collect();

        Ok(Assignment::find_all_by_documents(&mut conn, &document_ids)?
            .into_iter()
            .map(|i| (AssignmentByDocumentId(i.document_id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SubmissionByDocumentId(pub Uuid);

impl Loader<SubmissionByDocumentId> for IkigaiDataLoader {
    type Value = Submission;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SubmissionByDocumentId],
    ) -> Result<HashMap<SubmissionByDocumentId, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let document_ids = keys.iter().map(|c| c.0).collect();

        Ok(Submission::find_by_documents(&mut conn, &document_ids)?
            .into_iter()
            .map(|i| (SubmissionByDocumentId(i.document_id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct DocumentById(pub Uuid);

impl Loader<DocumentById> for IkigaiDataLoader {
    type Value = Document;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[DocumentById],
    ) -> Result<HashMap<DocumentById, Self::Value>, Self::Error> {
        let mut conn = get_conn_from_actor().await?;
        let document_ids = keys.iter().map(|c| c.0).collect();

        Ok(Document::find_by_ids(&mut conn, document_ids)?
            .into_iter()
            .map(|i| (DocumentById(i.id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct FindDocumentType(pub Uuid);

impl Loader<FindDocumentType> for IkigaiDataLoader {
    type Value = DocumentType;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindDocumentType],
    ) -> std::result::Result<HashMap<FindDocumentType, Self::Value>, Self::Error> {
        let document_ids: Vec<Uuid> = keys.iter().map(|k| k.0).collect();
        let mut conn = get_conn_from_actor().await?;

        let assignments = Assignment::find_all_by_documents(&mut conn, &document_ids)?;
        let submissions = Submission::find_by_documents(&mut conn, &document_ids)?;

        let mut result: HashMap<FindDocumentType, Self::Value> = HashMap::new();
        for key in keys {
            let mut document_type = DocumentType::Folder;

            if assignments
                .iter()
                .any(|assignment| assignment.document_id == key.0)
            {
                document_type = DocumentType::Assignment;
            }

            if submissions
                .iter()
                .any(|submission| submission.document_id == key.0)
            {
                document_type = DocumentType::Submission;
            }

            result.insert(*key, document_type);
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindPageByDocumentId {
    pub document_id: Uuid,
}

impl Loader<FindPageByDocumentId> for IkigaiDataLoader {
    type Value = Vec<Page>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindPageByDocumentId],
    ) -> std::result::Result<HashMap<FindPageByDocumentId, Self::Value>, Self::Error> {
        if keys.is_empty() {
            return Ok(HashMap::new());
        }

        let document_ids = keys.iter().map(|key| key.document_id).unique().collect();
        let mut conn = get_conn_from_actor().await?;
        let pages = Page::find_all_by_document_ids(&mut conn, document_ids)?;

        let mut result: HashMap<FindPageByDocumentId, Self::Value> = HashMap::new();
        for page in pages {
            let key = FindPageByDocumentId {
                document_id: page.document_id,
            };
            if let Some(inner_pages) = result.get_mut(&key) {
                inner_pages.push(page);
            } else {
                result.insert(key, vec![page]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindPageContentByPageId {
    pub page_id: Uuid,
}

impl Loader<FindPageContentByPageId> for IkigaiDataLoader {
    type Value = Vec<PageContent>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindPageContentByPageId],
    ) -> std::result::Result<HashMap<FindPageContentByPageId, Self::Value>, Self::Error> {
        if keys.is_empty() {
            return Ok(HashMap::new());
        }

        let page_ids = keys.iter().map(|key| key.page_id).unique().collect();
        let mut conn = get_conn_from_actor().await?;
        let page_contents = PageContent::find_all_by_pages(&mut conn, page_ids)?;

        let mut result: HashMap<FindPageContentByPageId, Self::Value> = HashMap::new();
        for page_content in page_contents {
            let key = FindPageContentByPageId {
                page_id: page_content.page_id,
            };
            if let Some(inner_pages) = result.get_mut(&key) {
                inner_pages.push(page_content);
            } else {
                result.insert(key, vec![page_content]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindQuizByPageContent {
    pub page_content_id: Uuid,
}

impl Loader<FindQuizByPageContent> for IkigaiDataLoader {
    type Value = Vec<Quiz>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindQuizByPageContent],
    ) -> Result<HashMap<FindQuizByPageContent, Self::Value>, Self::Error> {
        let page_content_ids = keys
            .iter()
            .map(|key| key.page_content_id)
            .unique()
            .collect();
        let mut conn = get_conn_from_actor().await?;
        let quizzes = Quiz::find_all_by_page_contents(&mut conn, &page_content_ids)?;

        let mut res: HashMap<FindQuizByPageContent, Self::Value> = HashMap::new();
        for quiz in quizzes {
            let key = FindQuizByPageContent {
                page_content_id: quiz.page_content_id,
            };
            if let Some(inner_quizzes) = res.get_mut(&key) {
                inner_quizzes.push(quiz);
            } else {
                res.insert(key, vec![quiz]);
            }
        }

        Ok(res)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindQuizUserAnswersByQuiz {
    pub quiz_id: Uuid,
}

impl Loader<FindQuizUserAnswersByQuiz> for IkigaiDataLoader {
    type Value = Vec<QuizUserAnswer>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindQuizUserAnswersByQuiz],
    ) -> std::result::Result<HashMap<FindQuizUserAnswersByQuiz, Self::Value>, Self::Error> {
        let quiz_ids = keys.iter().map(|key| key.quiz_id).unique().collect();
        let mut conn = get_conn_from_actor().await?;
        let answers = QuizUserAnswer::find_all_by_quizzes(&mut conn, &quiz_ids)?;

        let mut res: HashMap<FindQuizUserAnswersByQuiz, Self::Value> = HashMap::new();
        for answer in answers {
            let key = FindQuizUserAnswersByQuiz {
                quiz_id: answer.quiz_id,
            };
            if let Some(inner_answers) = res.get_mut(&key) {
                inner_answers.push(answer);
            } else {
                res.insert(key, vec![answer]);
            }
        }

        Ok(res)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindQuiz {
    pub quiz_id: Uuid,
}

impl Loader<FindQuiz> for IkigaiDataLoader {
    type Value = Quiz;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindQuiz],
    ) -> std::result::Result<HashMap<FindQuiz, Self::Value>, Self::Error> {
        let quiz_ids = keys.iter().map(|quiz| quiz.quiz_id).unique().collect();
        let mut conn = get_conn_from_actor().await?;
        let quizzes = Quiz::find_all(&mut conn, &quiz_ids)?;

        Ok(quizzes
            .into_iter()
            .map(|quiz| (FindQuiz { quiz_id: quiz.id }, quiz))
            .collect())
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindDocumentTag {
    pub document_id: Uuid,
}

impl Loader<FindDocumentTag> for IkigaiDataLoader {
    type Value = Vec<DocumentTag>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindDocumentTag],
    ) -> std::result::Result<HashMap<FindDocumentTag, Self::Value>, Self::Error> {
        if keys.is_empty() {
            return Ok(HashMap::new());
        }
        let document_ids = keys.iter().map(|key| key.document_id).unique().collect();

        let mut conn = get_conn_from_actor().await?;
        let tags = DocumentTag::find_by_document_ids(&mut conn, &document_ids)?;

        let mut res: HashMap<FindDocumentTag, Self::Value> = HashMap::new();
        for tag in tags {
            let key = FindDocumentTag {
                document_id: tag.document_id,
            };
            if let Some(inner_tags) = res.get_mut(&key) {
                inner_tags.push(tag);
            } else {
                res.insert(key, vec![tag]);
            }
        }

        Ok(res)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindEmbeddedSessionResponses {
    pub embedded_session_id: Uuid,
}

impl Loader<FindEmbeddedSessionResponses> for IkigaiDataLoader {
    type Value = Vec<EmbeddedSessionResponse>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindEmbeddedSessionResponses],
    ) -> std::result::Result<HashMap<FindEmbeddedSessionResponses, Self::Value>, Self::Error> {
        if keys.is_empty() {
            return Ok(HashMap::new());
        }
        let session_ids = keys.iter().map(|key| key.embedded_session_id).collect();
        let mut conn = get_conn_from_actor().await?;
        let responses = EmbeddedSessionResponse::find_all_by_sessions(&mut conn, session_ids)?;

        let mut res: HashMap<FindEmbeddedSessionResponses, Self::Value> = HashMap::new();
        for response in responses {
            let key = FindEmbeddedSessionResponses {
                embedded_session_id: response.session_id,
            };
            if let Some(inner_responses) = res.get_mut(&key) {
                inner_responses.push(response);
            } else {
                res.insert(key, vec![response]);
            }
        }

        Ok(res)
    }
}
