use std::collections::HashMap;

use async_graphql::dataloader::*;
use async_graphql::*;
use itertools::Itertools;
use uuid::Uuid;

use crate::connection_pool::get_conn_from_actor;
use crate::db::*;

use crate::error::OpenExamError;

#[derive(Clone)]
pub struct OpenExamDataLoader;

/// Load User Info by user id
#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct FindPublicUserById(pub i32);

#[async_trait::async_trait]
impl Loader<FindPublicUserById> for OpenExamDataLoader {
    type Value = PublicUser;
    type Error = OpenExamError;

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
impl Loader<FindUserById> for OpenExamDataLoader {
    type Value = User;
    type Error = OpenExamError;

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
impl Loader<FileById> for OpenExamDataLoader {
    type Value = File;
    type Error = OpenExamError;

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
impl Loader<MembersByClassId> for OpenExamDataLoader {
    type Value = Vec<Member>;
    type Error = OpenExamError;

    async fn load(
        &self,
        keys: &[MembersByClassId],
    ) -> Result<HashMap<MembersByClassId, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let class_ids = keys.iter().map(|c| c.0).collect::<Vec<i32>>();
        let members = Member::find_all_by_classes(&conn, class_ids)?;

        let mut result: HashMap<MembersByClassId, Self::Value> = HashMap::new();
        for member in members {
            let id = MembersByClassId(member.class_id);
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
pub struct ClassById(pub i32);

#[async_trait::async_trait]
impl Loader<ClassById> for OpenExamDataLoader {
    type Value = Class;
    type Error = OpenExamError;

    async fn load(
        &self,
        keys: &[ClassById],
    ) -> Result<HashMap<ClassById, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let class_ids = keys.iter().map(|c| c.0).unique().collect::<Vec<i32>>();
        let res = Class::find_all_by_ids(&conn, class_ids)?;
        Ok(res.into_iter().map(|p| (ClassById(p.id), p)).collect())
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct ClassByDocumentId(pub Uuid);

#[async_trait::async_trait]
impl Loader<ClassByDocumentId> for OpenExamDataLoader {
    type Value = Class;
    type Error = OpenExamError;

    async fn load(
        &self,
        keys: &[ClassByDocumentId],
    ) -> std::result::Result<HashMap<ClassByDocumentId, Self::Value>, Self::Error> {
        let document_ids = keys.iter().map(|i| i.0).unique().collect::<Vec<Uuid>>();
        let conn = get_conn_from_actor().await?;
        let class_documents = ClassDocument::find_all_by_document_ids(&conn, document_ids)?;

        let class_ids = class_documents
            .iter()
            .map(|i| i.class_id)
            .unique()
            .collect();
        let classes: HashMap<i32, Class> = Class::find_all_by_ids(&conn, class_ids)?
            .into_iter()
            .map(|c| (c.id, c))
            .collect();
        let class_document_hashmap: HashMap<Uuid, ClassDocument> = class_documents
            .into_iter()
            .map(|i| (i.document_id, i))
            .collect();

        let mut res: HashMap<ClassByDocumentId, Self::Value> = HashMap::new();
        for key in keys {
            let class_document = class_document_hashmap.get(&key.0);
            let class = class_document.and_then(|i| classes.get(&i.class_id));

            if let Some(class) = class {
                res.insert(*key, class.clone());
            }
        }

        Ok(res)
    }
}

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
pub struct SubmissionById(pub i32);

#[async_trait::async_trait]
impl Loader<SubmissionById> for OpenExamDataLoader {
    type Value = Submission;
    type Error = OpenExamError;

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
impl Loader<SubmissionByAssignmentId> for OpenExamDataLoader {
    type Value = Vec<Submission>;
    type Error = OpenExamError;

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
impl Loader<AssignmentById> for OpenExamDataLoader {
    type Value = Assignment;
    type Error = OpenExamError;

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
impl Loader<AssignmentByDocumentId> for OpenExamDataLoader {
    type Value = Assignment;
    type Error = OpenExamError;

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
impl Loader<SubmissionByDocumentId> for OpenExamDataLoader {
    type Value = Submission;
    type Error = OpenExamError;

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
impl Loader<ThreadById> for OpenExamDataLoader {
    type Value = Thread;
    type Error = OpenExamError;

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
impl Loader<DocumentById> for OpenExamDataLoader {
    type Value = Document;
    type Error = OpenExamError;

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
impl Loader<QuizStructureById> for OpenExamDataLoader {
    type Value = QuizStructure;
    type Error = OpenExamError;

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
impl Loader<QuizId> for OpenExamDataLoader {
    type Value = Quiz;
    type Error = OpenExamError;

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
impl Loader<AnswersByQuiz> for OpenExamDataLoader {
    type Value = Vec<QuizAnswer>;
    type Error = OpenExamError;

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
impl Loader<QuizAnswerByUser> for OpenExamDataLoader {
    type Value = QuizAnswer;
    type Error = OpenExamError;

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
impl Loader<FindOrganizationMember> for OpenExamDataLoader {
    type Value = OrganizationMember;
    type Error = OpenExamError;

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
impl Loader<ClassMemberByUserId> for OpenExamDataLoader {
    type Value = Vec<Member>;
    type Error = OpenExamError;

    async fn load(
        &self,
        keys: &[ClassMemberByUserId],
    ) -> std::result::Result<HashMap<ClassMemberByUserId, Self::Value>, Self::Error> {
        let conn = get_conn_from_actor().await?;
        let user_ids: Vec<i32> = keys.iter().map(|c| c.0).collect();
        let members = Member::find_all_by_users(&conn, user_ids)?;

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
impl Loader<FindDocumentType> for OpenExamDataLoader {
    type Value = DocumentType;
    type Error = OpenExamError;

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
impl Loader<FindNestedDocumentsOfPageBlock> for OpenExamDataLoader {
    type Value = Vec<PageBlockDocument>;
    type Error = OpenExamError;

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
impl Loader<LoadCommentsOfThread> for OpenExamDataLoader {
    type Value = Vec<Comment>;
    type Error = OpenExamError;

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
impl Loader<FindOrgById> for OpenExamDataLoader {
    type Value = Organization;
    type Error = OpenExamError;

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
pub struct FindCategoryTags {
    pub category_id: Uuid,
}

#[async_trait::async_trait]
impl Loader<FindCategoryTags> for OpenExamDataLoader {
    type Value = Vec<CategoryTag>;
    type Error = OpenExamError;

    async fn load(
        &self,
        keys: &[FindCategoryTags],
    ) -> std::result::Result<HashMap<FindCategoryTags, Self::Value>, Self::Error> {
        let category_ids = keys.iter().map(|key| key.category_id).collect();
        let conn = get_conn_from_actor().await?;
        let category_tags = CategoryTag::find_by_ids(&conn, category_ids)?;

        let mut result: HashMap<FindCategoryTags, Self::Value> = HashMap::new();
        for category_tag in category_tags {
            let key = FindCategoryTags {
                category_id: category_tag.category_id,
            };
            if let Some(inner_tags) = result.get_mut(&key) {
                inner_tags.push(category_tag);
            } else {
                result.insert(key, vec![category_tag]);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct FindDocumentTemplateTags {
    pub template_id: Uuid,
}

#[async_trait::async_trait]
impl Loader<FindDocumentTemplateTags> for OpenExamDataLoader {
    type Value = Vec<DocumentTemplateTag>;
    type Error = OpenExamError;

    async fn load(
        &self,
        keys: &[FindDocumentTemplateTags],
    ) -> std::result::Result<HashMap<FindDocumentTemplateTags, Self::Value>, Self::Error> {
        let template_ids = keys.iter().map(|key| key.template_id).collect();
        let conn = get_conn_from_actor().await?;
        let template_tags = DocumentTemplateTag::find_by_templates(&conn, template_ids)?;

        let mut result: HashMap<FindDocumentTemplateTags, Self::Value> = HashMap::new();
        for template_tag in template_tags {
            let key = FindDocumentTemplateTags {
                template_id: template_tag.document_template_id,
            };
            if let Some(inner_tags) = result.get_mut(&key) {
                inner_tags.push(template_tag);
            } else {
                result.insert(key, vec![template_tag]);
            }
        }

        Ok(result)
    }
}
