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

#[async_trait::async_trait]
impl Loader<FindPublicUserById> for IkigaiDataLoader {
    type Value = PublicUser;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindPublicUserById],
    ) -> Result<HashMap<FindPublicUserById, PublicUser>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let ids = keys.iter().map(|u| u.0).collect();
        let users = User::find_by_ids(&conn, &ids)?;
        Ok(users
            .into_iter()
            .map(|user| (FindPublicUserById(user.id), PublicUser::from(user)))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct FindUserById(pub i32);

#[async_trait::async_trait]
impl Loader<FindUserById> for IkigaiDataLoader {
    type Value = User;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindUserById],
    ) -> Result<HashMap<FindUserById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let ids = keys.iter().map(|u| u.0).collect();
        let users = User::find_by_ids(&conn, &ids)?;
        Ok(users
            .into_iter()
            .map(|user| (FindUserById(user.id), user))
            .collect())
    }
}

/// Load File by File Id
#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct FileById(pub Uuid);

#[async_trait::async_trait]
impl Loader<FileById> for IkigaiDataLoader {
    type Value = File;
    type Error = IkigaiError;

    async fn load(&self, keys: &[FileById]) -> Result<HashMap<FileById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let file_ids = keys.iter().map(|k| k.0).collect::<Vec<Uuid>>();
        let res = File::find_all_by_ids(&conn, &file_ids)?;
        Ok(res.into_iter().map(|f| (FileById(f.uuid), f)).collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct MembersByClassId(pub i32);

#[async_trait::async_trait]
impl Loader<MembersByClassId> for IkigaiDataLoader {
    type Value = Vec<SpaceMember>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[MembersByClassId],
    ) -> Result<HashMap<MembersByClassId, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let class_ids = keys.iter().map(|c| c.0).collect::<Vec<i32>>();
        let members = SpaceMember::find_all_by_classes(&conn, class_ids)?;

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

#[async_trait::async_trait]
impl Loader<SpaceById> for IkigaiDataLoader {
    type Value = Space;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SpaceById],
    ) -> Result<HashMap<SpaceById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let class_ids = keys.iter().map(|c| c.0).unique().collect::<Vec<i32>>();
        let res = Space::find_all_by_ids(&conn, class_ids)?;
        Ok(res.into_iter().map(|p| (SpaceById(p.id), p)).collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SpaceByDocumentId(pub Uuid);

#[async_trait::async_trait]
impl Loader<SpaceByDocumentId> for IkigaiDataLoader {
    type Value = Space;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SpaceByDocumentId],
    ) -> std::result::Result<HashMap<SpaceByDocumentId, Self::Value>, Self::Error> {
        let document_ids = keys.iter().map(|i| i.0).unique().collect::<Vec<Uuid>>();
        let conn = get_conn_from_actor().await?;
        let documents = Document::find_by_ids(&conn, document_ids)?;
        let space_ids: Vec<i32> = documents
            .iter()
            .filter_map(|d| d.space_id)
            .unique()
            .collect();

        let spaces: HashMap<i32, Space> = Space::find_all_by_ids(&conn, space_ids)?
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

#[async_trait::async_trait]
impl Loader<SubmissionById> for IkigaiDataLoader {
    type Value = Submission;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SubmissionById],
    ) -> std::result::Result<HashMap<SubmissionById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let submission_ids = keys.iter().map(|c| c.0).collect();
        Ok(Submission::find_all_by_ids(&conn, submission_ids)?
            .into_iter()
            .map(|submission| (SubmissionById(submission.id), submission))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SubmissionByAssignmentId(pub i32);

#[async_trait::async_trait]
impl Loader<SubmissionByAssignmentId> for IkigaiDataLoader {
    type Value = Vec<Submission>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SubmissionByAssignmentId],
    ) -> Result<HashMap<SubmissionByAssignmentId, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let assignment_ids = keys.iter().map(|c| c.0).collect();

        let mut result: HashMap<SubmissionByAssignmentId, Self::Value> = HashMap::new();
        for item in Submission::find_all_by_assignments(&conn, assignment_ids)? {
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

#[async_trait::async_trait]
impl Loader<AssignmentById> for IkigaiDataLoader {
    type Value = Assignment;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[AssignmentById],
    ) -> Result<HashMap<AssignmentById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let assignment_ids = keys.iter().map(|c| c.0).collect();

        Ok(Assignment::find_all_by_ids(&conn, assignment_ids)?
            .into_iter()
            .map(|i| (AssignmentById(i.id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct AssignmentByDocumentId(pub Uuid);

#[async_trait::async_trait]
impl Loader<AssignmentByDocumentId> for IkigaiDataLoader {
    type Value = Assignment;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[AssignmentByDocumentId],
    ) -> Result<HashMap<AssignmentByDocumentId, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let document_ids = keys.iter().map(|c| c.0).collect();

        Ok(Assignment::find_all_by_documents(&conn, &document_ids)?
            .into_iter()
            .map(|i| (AssignmentByDocumentId(i.document_id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SubmissionByDocumentId(pub Uuid);

#[async_trait::async_trait]
impl Loader<SubmissionByDocumentId> for IkigaiDataLoader {
    type Value = Submission;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[SubmissionByDocumentId],
    ) -> Result<HashMap<SubmissionByDocumentId, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let document_ids = keys.iter().map(|c| c.0).collect();

        Ok(Submission::find_by_documents(&conn, document_ids)?
            .into_iter()
            .map(|i| (SubmissionByDocumentId(i.document_id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct ThreadById(pub i32);

#[async_trait::async_trait]
impl Loader<ThreadById> for IkigaiDataLoader {
    type Value = Thread;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[ThreadById],
    ) -> Result<HashMap<ThreadById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let thread_ids = keys.iter().map(|c| c.0).collect();

        Ok(Thread::find_all_by_ids(&conn, thread_ids)?
            .into_iter()
            .map(|i| (ThreadById(i.id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct DocumentById(pub Uuid);

#[async_trait::async_trait]
impl Loader<DocumentById> for IkigaiDataLoader {
    type Value = Document;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[DocumentById],
    ) -> Result<HashMap<DocumentById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let document_ids = keys.iter().map(|c| c.0).collect();

        Ok(Document::find_by_ids(&conn, document_ids)?
            .into_iter()
            .map(|i| (DocumentById(i.id), i))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct QuizStructureById(pub Uuid);

#[async_trait::async_trait]
impl Loader<QuizStructureById> for IkigaiDataLoader {
    type Value = QuizStructure;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[QuizStructureById],
    ) -> std::result::Result<HashMap<QuizStructureById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let quiz_structure_ids = keys.iter().map(|c| c.0).collect();
        Ok(QuizStructure::find_by_ids(&conn, quiz_structure_ids)?
            .into_iter()
            .map(|q| (QuizStructureById(q.id), q))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct QuizId(pub Uuid);

#[async_trait::async_trait]
impl Loader<QuizId> for IkigaiDataLoader {
    type Value = Quiz;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[QuizId],
    ) -> std::result::Result<HashMap<QuizId, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let quiz_ids = keys.iter().map(|c| c.0).collect();
        Ok(Quiz::find_by_ids(&conn, quiz_ids)?
            .into_iter()
            .map(|q| (QuizId(q.id), q))
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct AnswersByQuiz(pub Uuid);

#[async_trait::async_trait]
impl Loader<AnswersByQuiz> for IkigaiDataLoader {
    type Value = Vec<QuizAnswer>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[AnswersByQuiz],
    ) -> std::result::Result<HashMap<AnswersByQuiz, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let quiz_ids = keys.iter().map(|c| c.0).collect();
        let answers = QuizAnswer::find_all_by_quiz_ids(&conn, quiz_ids)?;

        let mut result: HashMap<AnswersByQuiz, Self::Value> = HashMap::new();
        for answer in answers {
            let key = AnswersByQuiz(answer.quiz_id);
            if let Some(answers) = result.get_mut(&key) {
                answers.push(answer);
            } else {
                result.insert(key, vec![answer]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct QuizAnswerByUser {
    pub user_id: i32,
    pub quiz_id: Uuid,
}

#[async_trait::async_trait]
impl Loader<QuizAnswerByUser> for IkigaiDataLoader {
    type Value = QuizAnswer;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[QuizAnswerByUser],
    ) -> std::result::Result<HashMap<QuizAnswerByUser, Self::Value>, Self::Error> {
        let user_ids: Vec<i32> = keys.iter().map(|key| key.user_id).unique().collect();
        let conn = get_conn_from_actor().await?;
        let mut answers = vec![];
        for user_id in user_ids {
            let quiz_ids = keys
                .iter()
                .filter(|key| key.user_id == user_id)
                .map(|key| key.quiz_id)
                .collect();
            answers.append(&mut QuizAnswer::find_all_by_quiz_ids_and_user(
                &conn, quiz_ids, user_id,
            )?)
        }

        let mut result: HashMap<QuizAnswerByUser, Self::Value> = HashMap::new();
        for answer in answers {
            let key = QuizAnswerByUser {
                user_id: answer.user_id,
                quiz_id: answer.quiz_id,
            };
            result.insert(key, answer);
        }

        Ok(result)
    }
}

// WARN: Only support one org_id
#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindOrganizationMember {
    pub org_id: OrganizationIdentity,
    pub user_id: i32,
}

#[async_trait::async_trait]
impl Loader<FindOrganizationMember> for IkigaiDataLoader {
    type Value = OrganizationMember;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindOrganizationMember],
    ) -> Result<HashMap<FindOrganizationMember, Self::Value>, Self::Error> {
        if keys.is_empty() {
            return Ok(HashMap::new());
        }

        let org_id = keys[0].org_id;
        let user_ids = keys.iter().map(|key| key.user_id).collect();
        let conn = get_conn_from_actor().await?;
        let org_members = OrganizationMember::find_all_org_users(&conn, org_id, &user_ids)?;

        Ok(org_members
            .into_iter()
            .map(|org_member| {
                (
                    FindOrganizationMember {
                        org_id,
                        user_id: org_member.user_id,
                    },
                    org_member,
                )
            })
            .collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct ClassMemberByUserId(pub i32);

#[async_trait::async_trait]
impl Loader<ClassMemberByUserId> for IkigaiDataLoader {
    type Value = Vec<SpaceMember>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[ClassMemberByUserId],
    ) -> std::result::Result<HashMap<ClassMemberByUserId, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let user_ids: Vec<i32> = keys.iter().map(|c| c.0).collect();
        let members = SpaceMember::find_all_by_users(&conn, &user_ids)?;

        let mut result: HashMap<ClassMemberByUserId, Self::Value> = HashMap::new();
        for member in members {
            let key = ClassMemberByUserId(member.user_id);
            if let Some(inside_members) = result.get_mut(&key) {
                inside_members.push(member);
            } else {
                result.insert(key, vec![member]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct FindDocumentType(pub Uuid);

#[async_trait::async_trait]
impl Loader<FindDocumentType> for IkigaiDataLoader {
    type Value = DocumentType;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindDocumentType],
    ) -> std::result::Result<HashMap<FindDocumentType, Self::Value>, Self::Error> {
        let document_ids: Vec<Uuid> = keys.iter().map(|k| k.0).collect();
        let conn = get_conn_from_actor().await?;

        let assignments = Assignment::find_all_by_documents(&conn, &document_ids)?;

        let mut result: HashMap<FindDocumentType, Self::Value> = HashMap::new();
        for key in keys {
            let mut document_type = DocumentType::Normal;

            if assignments
                .iter()
                .any(|assignment| assignment.document_id == key.0)
            {
                document_type = DocumentType::Assignment;
            }

            result.insert(*key, document_type);
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindNestedDocumentsOfPageBlock {
    pub page_block_id: Uuid,
}

#[async_trait::async_trait]
impl Loader<FindNestedDocumentsOfPageBlock> for IkigaiDataLoader {
    type Value = Vec<PageBlockDocument>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindNestedDocumentsOfPageBlock],
    ) -> std::result::Result<HashMap<FindNestedDocumentsOfPageBlock, Self::Value>, Self::Error>
    {
        if keys.is_empty() {
            return Ok(HashMap::new());
        }

        let page_block_ids = keys.iter().map(|key| key.page_block_id).collect();
        let conn = get_conn_from_actor().await?;
        let nested_documents = PageBlockDocument::find_all_by_page_blocks(&conn, page_block_ids)?;
        let mut result: HashMap<FindNestedDocumentsOfPageBlock, Vec<PageBlockDocument>> =
            HashMap::new();

        for nested_document in nested_documents {
            let key = FindNestedDocumentsOfPageBlock {
                page_block_id: nested_document.page_block_id,
            };
            if let Some(inner_items) = result.get_mut(&key) {
                inner_items.push(nested_document);
            } else {
                result.insert(key, vec![nested_document]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct LoadCommentsOfThread {
    pub thread_id: i32,
}

#[async_trait::async_trait]
impl Loader<LoadCommentsOfThread> for IkigaiDataLoader {
    type Value = Vec<Comment>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[LoadCommentsOfThread],
    ) -> std::result::Result<HashMap<LoadCommentsOfThread, Self::Value>, Self::Error> {
        let thread_ids = keys.iter().map(|key| key.thread_id).collect();
        let conn = get_conn_from_actor().await?;
        let comments = Comment::find_all_by_threads(&conn, thread_ids)?;

        let mut result: HashMap<LoadCommentsOfThread, Self::Value> = HashMap::new();
        for comment in comments {
            let key = LoadCommentsOfThread {
                thread_id: comment.thread_id,
            };
            if let Some(inner_comments) = result.get_mut(&key) {
                inner_comments.push(comment);
            } else {
                result.insert(key, vec![comment]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindOrgById {
    pub org_id: i32,
}

#[async_trait::async_trait]
impl Loader<FindOrgById> for IkigaiDataLoader {
    type Value = Organization;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindOrgById],
    ) -> std::result::Result<HashMap<FindOrgById, Self::Value>, Self::Error> {
        let org_ids = keys.iter().map(|key| key.org_id).collect();
        let conn = get_conn_from_actor().await?;
        let organizations = Organization::find_all_by_ids(&conn, org_ids)?;
        Ok(organizations
            .into_iter()
            .map(|o| (FindOrgById { org_id: o.id }, o))
            .collect())
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindDocumentAssignedUsers {
    pub document_id: Uuid,
}

#[async_trait::async_trait]
impl Loader<FindDocumentAssignedUsers> for IkigaiDataLoader {
    type Value = Vec<DocumentAssignedUser>;
    type Error = IkigaiError;

    async fn load(
        &self,
        keys: &[FindDocumentAssignedUsers],
    ) -> std::result::Result<HashMap<FindDocumentAssignedUsers, Self::Value>, Self::Error> {
        if keys.is_empty() {
            return Ok(HashMap::new());
        }

        let document_ids = keys.iter().map(|key| key.document_id).unique().collect();
        let conn = get_conn_from_actor().await?;
        let items = DocumentAssignedUser::find_all_by_documents(&conn, document_ids)?;

        let mut result: HashMap<FindDocumentAssignedUsers, Self::Value> = HashMap::new();
        for item in items {
            let key = FindDocumentAssignedUsers {
                document_id: item.document_id,
            };
            if let Some(inner_items) = result.get_mut(&key) {
                inner_items.push(item);
            } else {
                result.insert(key, vec![item]);
            }
        }

        Ok(result)
    }
}
