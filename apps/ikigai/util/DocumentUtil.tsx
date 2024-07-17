import { Badge } from "@radix-ui/themes";

import { DocumentActionPermission, DocumentType } from "graphql/types";
import { allow } from "hook/UsePermission";
import { IQuizAnswer } from "store/QuizStore";
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

export const documentIcon = (item?: {
  isDefaultFolderPrivate: boolean;
  documentType: DocumentType;
}) =>
  item?.isDefaultFolderPrivate
    ? "🔏"
    : item?.documentType === DocumentType.FOLDER
    ? "📁"
    : "📝";

export const getQuizColor = (answer: IQuizAnswer) => {
  return !allow(DocumentActionPermission.VIEW_ANSWER)
    ? "indigo"
    : !answer?.score
    ? "red"
    : "green";
};

export const getQuizAnswerColor = (answer?: IQuizAnswer) => {
  if (!answer) return "mauve";
  return !allow(DocumentActionPermission.VIEW_ANSWER)
    ? "indigo"
    : !answer?.score
    ? "red"
    : "green";
};
