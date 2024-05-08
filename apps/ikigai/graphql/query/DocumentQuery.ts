import { gql } from "@apollo/client";

export const GET_DOCUMENT_DETAIL = gql`
  query GetDocumentDetail($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      body
      title
      isPublic
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
          name
          avatar {
            publicUrl
          }
          randomColor
        }
        assignment {
          id
          bandScoreId
          testDuration
          documentId
          gradeByRubricId
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

export const GET_DOCUMENT_ASSIGNED_USERS = gql`
  query GetDocumentAssignedUsers($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      assignedUsers {
        assignedUserId
        user {
          id
          firstName
          lastName
          name
          avatar {
            publicUrl
          }
          randomColor
          email
        }
      }
    }
  }
`;

export const GET_DOCUMENT_V2 = gql`
  query GetDocumentV2($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      body
      title
      isPublic
      coverPhotoId
      coverPhotoUrl
      editorConfig
      updatedAt
      deletedAt
      spaceId
    }
  }
`;
