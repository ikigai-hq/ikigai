import { gql } from "@apollo/client";

export const SUBMISSION_SUBSCRIPTION = gql`
  subscription SubmissionSubscribe($submissionId: Int!) {
    submissionSubscribe(submissionId: $submissionId) {
      submissionId
      eventType
    }
  }
`;
