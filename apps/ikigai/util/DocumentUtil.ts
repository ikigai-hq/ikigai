import { ISubmission } from "store/DocumentStore";

export enum SubmissionStatus {
  NotSubmitted = "Not Submitted",
  InDoing = "In Doing",
  Submitted = "Submitted",
  Graded = "Graded",
}

export const getSubmissionStatus = (submission: ISubmission) => {
  if (submission.feedbackAt) return SubmissionStatus.Graded;
  if (submission.submitAt) return SubmissionStatus.Submitted;
  return SubmissionStatus.InDoing;
};
