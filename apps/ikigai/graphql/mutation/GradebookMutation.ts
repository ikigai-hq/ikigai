import { gql } from "@apollo/client";

export const UPDATE_ASSIGNMENT = gql`
  mutation UpdateAssignment($assignmentId: Int!, $data: UpdateAssignmentData!) {
    assignmentUpdate(assignmentId: $assignmentId, data: $data)
  }
`;

export const STUDENT_START_SUBMISSION = gql`
  mutation StartSubmission($assignmentId: Int!) {
    assignmentStartSubmission(assignmentId: $assignmentId) {
      id
      documentId
    }
  }
`;

export const STUDENT_REDO_SUBMISSION = gql`
  mutation StudentRedoSubmission($submissionId: Int!) {
    assignmentRedo(submissionId: $submissionId)
  }
`;

export const STUDENT_SUBMIT_SUBMISSION = gql`
  mutation StudentSubmitSubmission($submissionId: Int!) {
    assignmentSubmitSubmission(submissionId: $submissionId) {
      id
    }
  }
`;

export const TEACHER_START_SUBMISSION = gql`
  mutation TeacherStartSubmission($assignmentId: Int!, $studentId: Int!) {
    assignmentStartByTeacher(
      assignmentId: $assignmentId
      studentId: $studentId
    ) {
      id
      documentId
    }
  }
`;

export const TEACHER_REVIEW_SUBMISSION = gql`
  mutation TeacherReviewSubmission(
    $submissionId: Int!
    $gradeData: GradeSubmissionData!
  ) {
    assignmentGradeSubmission(
      submissionId: $submissionId
      gradeData: $gradeData
    )
  }
`;

export const TEACHER_REQUEST_REDO = gql`
  mutation TeacherRequestRedo($submissionId: Int!) {
    assignmentRequestRedo(submissionId: $submissionId)
  }
`;

export const UPSERT_RUBRIC = gql`
  mutation UpsertRubric($rubric: RubricInput!) {
    orgUpsertRubric(rubric: $rubric) {
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

export const REMOVE_RUBRIC = gql`
  mutation RemoveRubric($rubricId: UUID!) {
    orgRemoveRubric(rubricId: $rubricId)
  }
`;

export const GRADE_RUBRIC_SUBMISSION = gql`
  mutation GradeRubricSubmission($data: RubricSubmissionInput!) {
    assignmentUpdateRubricSubmission(data: $data) {
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
`;
