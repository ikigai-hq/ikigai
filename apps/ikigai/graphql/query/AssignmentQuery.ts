import { gql } from "@apollo/client";

export const GET_SUBMISSIONS_OF_ASSIGNMENT = gql`
  query GetSubmissionsOfAssignment($assignmentId: Int!) {
    assignmentGetSubmissions(assignmentId: $assignmentId) {
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
      attemptNumber
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
