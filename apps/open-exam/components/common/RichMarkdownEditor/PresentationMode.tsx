import usePageBlockStore from "context/ZustandPageBlockStore";
import React, { Fragment } from "react";
import { ReviewPageBlocks } from "./extensions/PageBlockExtension/ReviewPageBlocks";
import { BodyWrapper, DocumentBodyContainer } from "components/Document/common";
import { QuestionBoxes } from "./extensions/PageBlockExtension/QuestionBoxes";
import styled from "styled-components";
import { RightPanel } from "components/Document/RightPanel";
import { GetDocumentDetail_documentGet as IDocumentDetail } from "graphql/types";
import Editor from "components/Document/Editor";
import { BreakPoints } from "styles/mediaQuery";
import useDocumentStore from "context/ZustandDocumentStore";
import { isMobileView } from "hook/UseSupportMobile";

interface Props {
  currentDocument: IDocumentDetail;
  isViewInMobileApp?: boolean;
  isDoingSubmission?: boolean;
  isReviewSubmission?: boolean;
}

export const PresentationMode: React.FC<Props> = ({
  currentDocument,
  isViewInMobileApp,
  isDoingSubmission,
  isReviewSubmission,
}) => {
  const pageBlocks = usePageBlockStore((state) => state.pageBlocks);
  const pageBlockMode = usePageBlockStore((state) => state.pageBlockMode);
  const isFocusMode = useDocumentStore((state) => state.isFocusMode);

  return (
    <Fragment>
      <DocumentBodyContainer $isPresentationMode={(!!pageBlocks.length && pageBlockMode) || isMobileView()}>
        <BodyWrapper>
          <>
            <FocusMode $isFocusMode={isFocusMode}>
              {pageBlockMode ? (
                <ReviewPageBlocks
                  isViewInMobileApp={isViewInMobileApp}
                  isPresentationMode
                  masterDocumentId={currentDocument?.id}
                />
              ) : (
                <Editor
                  isViewInMobileApp={isViewInMobileApp}
                  document={currentDocument}
                />
              )}
            </FocusMode>
            {!isViewInMobileApp &&
              (isDoingSubmission || isReviewSubmission) && <RightPanel />}
          </>
        </BodyWrapper>
      </DocumentBodyContainer>
      {!!pageBlocks.length && pageBlockMode && (
        <BottomQuestionBoxes>
          <QuestionBoxes isPresentationMode documentId={currentDocument?.id} />
        </BottomQuestionBoxes>
      )}
    </Fragment>
  );
};

const BottomQuestionBoxes = styled.div`
  margin: 18px 24px;

  ${BreakPoints.tablet} {
    margin: 16px 10px;
  }
`;

const FocusMode= styled.div<{ $isFocusMode?: boolean }>`
  width: 100%;
  flex-grow: 1;
  overflow: auto;

  ${props => props.$isFocusMode && `
    transition: all 0.2s;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 3;
  `};
`;
