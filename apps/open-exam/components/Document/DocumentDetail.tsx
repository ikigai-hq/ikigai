import React, { useEffect } from "react";
import { HideRule, OrgRole } from "graphql/types";
import useAuthUserStore from "context/ZustandAuthStore";
import { DocumentType, getDocumentType } from "util/permission";
import ReviewAssignmentDocument from "./Assignment/ReviewAssignmentDocument";
import { BodyWrapper, Container, DocumentBodyContainer } from "./common";
import Editor from "./Editor";
import DoingSubmissionDocument from "./Submission/DoingSubmissionDocument";
import ReviewSubmissionDocumentHeader from "./Submission/ReviewSubmissionDocumentHeader";
import AssignmentHeader from "./Assignment/AssignmentHeader";
import DocumentHeader from "./DocumentHeader";
import { useRouter } from "next/router";
import { formatDocumentRoute } from "config/Routes";
import LeftPanel from "./LeftPanel";
import useClassStore from "context/ZustandClassStore";
import { RightPanel } from "./RightPanel";
import usePageBlockStore from "context/ZustandPageBlockStore";
import { ReviewPageBlocks } from "components/common/RichMarkdownEditor/extensions/PageBlockExtension/ReviewPageBlocks";
import { PresentationMode } from "components/common/RichMarkdownEditor/PresentationMode";
import useDocumentStore from "context/ZustandDocumentStore";
import useSubmissionStatus from "hook/UseSubmissionStatus";

const DocumentDetail = () => {
  const { push } = useRouter();
  const authUser = useAuthUserStore((state) => state.currentUser);
  const isStudent =
    authUser?.userMe?.activeOrgMember?.orgRole === OrgRole.STUDENT;
  const docs = useClassStore((state) =>
    (state.documents || [])
      .filter((doc) => !doc.document.deletedAt)
      .filter(
        (doc) =>
          doc.document.hideRule === HideRule.PUBLIC ||
          (doc.document.hideRule === HideRule.PRIVATE && !isStudent),
      ),
  );
  const pageBlockMode = usePageBlockStore((state) => state.pageBlockMode);
  const mapPageBlockData = usePageBlockStore((state) => state.mapPageBlockData);
  const updatePageBlockMode = usePageBlockStore(
    (state) => state.updatePageBlockMode,
  );

  const masterDocument = useDocumentStore(
    (state) => state.masterDocument,
    (state, newState) => {
      if (state?.title !== newState?.title) return false;
      if (state?.coverPhotoUrl !== newState?.coverPhotoUrl) return false;
      return state?.editorConfig === newState?.editorConfig;
    },
  );
  const setRightPanelHidden = useDocumentStore(
    (state) => state.setRightPanelHidden,
  );

  // Permission check
  const docType = getDocumentType(masterDocument);
  const isSubmissionDocument = docType === DocumentType.Submission;
  const isAssignmentDocument = docType === DocumentType.Assignment;

  useEffect(() => {
    if (
      mapPageBlockData.get(masterDocument.id)?.length > 0 &&
      isSubmissionDocument
    ) {
      updatePageBlockMode(true);
    }
  }, [masterDocument.id, mapPageBlockData]);

  useEffect(() => {
    if (pageBlockMode) {
      setRightPanelHidden(true);
    }
  }, [pageBlockMode]);

  // Student:
  // - view assignment before jump to detail assignment.
  // - view/edit doing submission., quizzes
  // - view last submission / graded submission.
  // - view report.

  // Teacher:
  // - view/edit assignment doc.
  // - view student's submission.
  // - view/edit report.

  const { isDoingSubmission } = useSubmissionStatus(masterDocument);
  const isReviewAssignmentBeforeDoing = isAssignmentDocument && isStudent;

  if (isDoingSubmission) {
    return <DoingSubmissionDocument currentDocument={masterDocument} />;
  }

  const moveBackToAssignment = async () => {
    updatePageBlockMode(false);
    await push(
      formatDocumentRoute(masterDocument.submission.assignment.documentId),
      undefined,
      { shallow: true },
    );
  };

  return (
    <Container>
      <DocumentHeader
        overrideClose={isSubmissionDocument ? moveBackToAssignment : undefined}
      >
        {isAssignmentDocument && !isStudent && (
          <AssignmentHeader document={masterDocument} />
        )}
        {isSubmissionDocument && (
          <ReviewSubmissionDocumentHeader document={masterDocument} />
        )}
      </DocumentHeader>

      {isSubmissionDocument ? (
        <PresentationMode isReviewSubmission currentDocument={masterDocument} />
      ) : (
        <DocumentBodyContainer>
          <BodyWrapper>
            {!isDoingSubmission && <LeftPanel docs={docs} />}
            <div style={{ flexGrow: 1, overflow: "hidden", width: "100%" }}>
              {isReviewAssignmentBeforeDoing ? (
                <ReviewAssignmentDocument
                  doc={masterDocument}
                  assignment={masterDocument.assignment}
                />
              ) : (
                <>
                  {pageBlockMode &&
                  mapPageBlockData.get(masterDocument.id)?.length ? (
                    <ReviewPageBlocks masterDocumentId={masterDocument.id} />
                  ) : (
                    <Editor document={masterDocument} />
                  )}
                </>
              )}
            </div>
            {!isReviewAssignmentBeforeDoing && <RightPanel />}
          </BodyWrapper>
        </DocumentBodyContainer>
      )}
    </Container>
  );
};

export default DocumentDetail;
