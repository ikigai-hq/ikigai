import { ISubmission } from "store/DocumentStore";
import { Badge } from "@radix-ui/themes";

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

export const StudentStatus = ({ status }: { status: SubmissionStatus }) => {
  if (status === SubmissionStatus.InDoing) {
    return <Badge color="orange">In Doing</Badge>;
  }
  if (status === SubmissionStatus.Submitted) {
    return <Badge color="blue">Submitted</Badge>;
  }
  if (status === SubmissionStatus.Graded) {
    return <Badge color="green">Graded</Badge>;
  }

  return <Badge color="bronze">Not Submitted</Badge>;
};
