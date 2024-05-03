import { GetDocumentDetail_documentGet } from "graphql/types";

export const canDoAssignment = (
  document: GetDocumentDetail_documentGet,
): string | undefined => {
  const assignment = document.assignment;
  if (!assignment) return "This is not assignment";

  const maxNumberOfAttempt = assignment.maxNumberOfAttempt;
  if (maxNumberOfAttempt) {
    const currentAttemptTime = assignment.mySubmission?.attemptNumber || 0;
    if (currentAttemptTime >= maxNumberOfAttempt) return "Max attempt time";
  }

  if (assignment?.mySubmission) {
    if (assignment.mySubmission.feedbackAt) {
      return "Submission was reviewed by your teacher.";
    }

    if (!assignment.mySubmission.submitAt) {
      return "You're doing this assignment. Click 'Continue' to continue do on the last submission";
    }
  }
};

export const DEFAULT_RIGHT_SIDE_WIDTH = 277;

export const DEFAULT_LEFT_SIDE_WIDTH = 302;

export const roundRealNumber = (n: number) => Math.round(n * 10000) / 10000;
