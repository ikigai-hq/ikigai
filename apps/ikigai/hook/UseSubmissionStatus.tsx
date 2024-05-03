import useAuthUserStore from "context/ZustandAuthStore";
import { GetDocumentDetail_documentGet as IDocument } from "graphql/types";
import { DocumentType, getDocumentType } from "util/permission";

const useSubmissionStatus = (
  document: IDocument,
): {
  isSubmissionDocument: boolean;
  isDoingSubmission: boolean;
  submission: IDocument;
  isStudent: boolean;
} => {
  const isStudent = useAuthUserStore((state) => state.checkHelper.isStudent);

  const docType = getDocumentType(document);
  const isSubmissionDocument = docType === DocumentType.Submission;
  const isDoingSubmission =
    isSubmissionDocument &&
    isStudent &&
    (!document.submission.isSubmitted || document.submission.allowRework);

  return {
    isSubmissionDocument,
    isDoingSubmission,
    submission: document,
    isStudent,
  };
};

export default useSubmissionStatus;
