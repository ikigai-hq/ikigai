import useAuthUserStore from "context/ZustandAuthStore";
import {
  GetDocumentDetail_documentGet as IDocument,
  OrgRole,
} from "graphql/types";
import { DocumentType, getDocumentType } from "util/permission";

const useSubmissionStatus = (
  document: IDocument,
): {
  isSubmissionDocument: boolean;
  isDoingSubmission: boolean;
  submission: IDocument;
  isStudent: boolean;
} => {
  const authUser = useAuthUserStore((state) => state.currentUser);
  const isStudent = authUser?.userMe?.activeOrgMember?.orgRole === OrgRole.STUDENT;

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
