import { GetDocumentDetail_documentGet, OrgRole } from "../graphql/types";
import { t } from "@lingui/macro";

export const getRoleColor = (role: OrgRole) => {
  switch (role) {
    case OrgRole.TEACHER:
      return "green";
    case OrgRole.STUDENT:
      return "geekblue";
  }
};

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

export const getRoleName = (orgRole: OrgRole) => {
  if (orgRole === OrgRole.TEACHER) return t`Teacher`;
  return t`Student`;
};

export const roundRealNumber = (n: number) => Math.round(n * 10000) / 10000;

export const capitalize = (str: string): string => {
  if (!str) return "";
  return [...str][0].toUpperCase() + str.slice(1);
};
