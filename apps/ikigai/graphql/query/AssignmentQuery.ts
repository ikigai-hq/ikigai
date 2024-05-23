import { gql } from "@apollo/client";

export const GET_BAND_SCORES = gql`
  query GetBandScores {
    assignmentGetBandScores {
      id
      name
      range {
        items {
          from
          to
          score
        }
      }
      updatedAt
      createdAt
    }
  }
`;

export const GET_SUBMISSIONS_OF_ASSIGNMENT = gql`
  query GetSubmissionsOfAssignment($assignmentDocumentId: UUID!) {
    documentGet(documentId: $assignmentDocumentId) {
      id
      assignment {
        id
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
      }
    }
  }
`;

export const GET_RUBRICS = gql`
  query GetRubrics {
    userGetMyRubrics {
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
  }
`;

export const GET_ASSIGNMENT_RUBRIC = gql`
  query GetAssignmentRubric($documentId: UUID!) {
    documentGet(documentId: $documentId) {
      id
      assignment {
        id
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
      }
    }
  }
`;
