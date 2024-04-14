import { gql } from "@apollo/client";

export const GET_DOCUMENT_DETAIL = gql`
  query GetDocumentDetail($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      body
      title
      isPublic
      hideRule
      coverPhotoId
      coverPhotoUrl
      editorConfig
      updatedAt
      deletedAt
      spaceId
      quizzes {
        id
        documentId
        deletedAt
        structure {
          id
          userId
          quizType
          quizTitle
          quizBody
          updatedAt
          createdAt
        }
        structureAnswer
        structureExplanation
        myAnswer {
          quizId
          userId
          answer
          isCorrect
        }
        answers {
          quizId
          userId
          answer
          isCorrect
          user {
            id
            firstName
            lastName
            avatar {
              publicUrl
            }
            randomColor
          }
        }
      }
      submission {
        id
        userId
        grade
        finalGrade
        feedback
        isSubmitted
        updatedAt
        createdAt
        startAt
        submitAt
        allowForStudentViewAnswer
        allowRework
        canChangeStructure
        user {
          id
          firstName
          lastName
          avatar {
            publicUrl
          }
          randomColor
          orgPersonalInformation {
            fullName
            avatar {
              publicUrl
            }
          }
        }
        assignment {
          id
          bandScoreId
          testDuration
          documentId
          gradeByRubricId
          document {
            id
            spaceId
          }
        }
        rubricGrade {
          submissionId
          rubricId
          gradedData {
            rubricType
            criteria
            weightingCriteria
            level
            items {
              explanation
              score
              toScore
              userPick {
                selected
                score
                comment
              }
            }
            totalUserScore
          }
        }
      }
      assignment {
        id
        gradedType
        gradeMethod
        preDescription
        maxNumberOfAttempt
        testDuration
        bandScoreId
        allowSubmissionChangeStructure
        gradeByRubricId
        weightingIntoFinalGrade
        rubric {
          id
          orgId
          name
          data {
            rubricType
            criteria
            weightingCriteria
            level
            items {
              explanation
              score
              toScore
              userPick {
                selected
                score
                comment
              }
            }
          }
          createdAt
        }
        submissions {
          id
          allowForStudentViewAnswer
          userId
          grade
          feedback
          documentId
          finalGrade
          updatedAt
          createdAt
          startAt
          submitAt
          isSubmitted
          feedbackAt
          finalGrade
          user {
            id
            firstName
            lastName
            avatar {
              publicUrl
            }
            randomColor
          }
        }
        mySubmission {
          id
          userId
          feedback
          documentId
          attemptNumber
          finalGrade
          feedbackAt
          submitAt
          allowRework
        }
      }
    }
  }
`;

export const GET_PAGE_BLOCKS = gql`
  query GetPageBlocks($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      body
      pageBlocks {
        id
        documentId
        title
        nestedDocuments {
          pageBlockId
          documentId
          index
          document {
            id
            body
          }
        }
      }
    }
  }
`;

export const GET_DOCUMENT_DETAIL_BY_UUID = gql`
  query GetDocumentDetailByUUID($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      body
      title
      isPublic
      coverPhotoUrl
      editorConfig
      quizzes {
        id
        myAnswer {
          answer
        }
      }
    }
  }
`;

export const GET_DELETED_DOCUMENTS = gql`
  query GetDeletedDocuments {
    documentGetDeletedDocuments {
      id
      title
      deletedAt
      coverPhotoUrl
    }
  }
`;

export const GET_COMMUNITY_TEMPLATE_CATEGORY = gql`
  query GetCommunityTemplateCategory {
    getCommunityDocumentTemplateCategories {
      id
      name
      orgId
      orgInternalIndex
      isCommunity
      communityIndex
      tags {
        tag
      }
    }
  }
`;

export const GET_COMMUNITY_TEMPLATES = gql`
  query GetCommunityTemplates {
    getCommunityDocumentTemplates {
      id
      name
      documentId
      isPublished
      orgId
      createdBy
      creator {
        id
        firstName
        lastName
        avatar {
          publicUrl
        }
        randomColor
      }
      tags {
        tag
      }
    }
  }
`;

export const GET_ORG_TEMPLATE_CATEGORY = gql`
  query GetOrgTemplateCategory {
    orgGetDocumentTemplateCategories {
      id
      name
      orgId
      orgInternalIndex
      isCommunity
      communityIndex
      tags {
        tag
      }
    }
  }
`;

export const GET_ORG_TEMPLATES = gql`
  query GetOrgTemplates {
    orgGetDocumentTemplates {
      id
      name
      documentId
      isPublished
      orgId
      createdBy
      creator {
        id
        firstName
        lastName
        avatar {
          publicUrl
        }
        randomColor
      }
      tags {
        tag
      }
    }
  }
`;

export const GET_ORG_TAGS = gql`
  query GetOrgTags {
    orgGetTags {
      name
    }
  }
`;


export const GET_DOCUMENT_HISTORY_VERSIONS = gql`
  query GetDocumentHistoryVersions($documentId: UUID!) {
    documentGetHistoryVersions(documentId: $documentId) {
      id
      rootDocumentId
      versioningDocumentId
      name
      creatorId
      createdAt
      createdBy {
        id
        firstName
        lastName
      }
    }
  }
`;
