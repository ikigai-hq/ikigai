import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { BreakPoints } from "styles/mediaQuery";
import LeftSide from "./LeftSide";
import DocumentBody from "./DocumentBody";
import RightSide from "./RightSide";
import { useLoadDocument } from "hook/UseLoadDocumentV2";

const Document = () => {
  const router = useRouter();
  const documentId = router.query.documentId as string;

  const { loading } = useLoadDocument(documentId);

  return (
    <Container>
      <DocumentHeaderWrapper>
        <StyledActionContainer>
          Header Space, Update later
        </StyledActionContainer>
      </DocumentHeaderWrapper>
      <DocumentBodyContainer>
        <BodyWrapper>
          <LeftSide />
          <DocumentBody loading={loading} />
          {/* <RightSide /> */}
        </BodyWrapper>
      </DocumentBodyContainer>
    </Container>
  );
};

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #fcfaf4;
`;

export const DocumentHeaderWrapper = styled.div`
  padding: 16px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
`;

const StyledActionContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-height: 28px;
  gap: 4px;
`;

export const DocumentBodyContainer = styled.div<{
  $isPresentationMode?: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
  margin-bottom: ${(props) => (props.$isPresentationMode ? 0 : "10px")};

  ${BreakPoints.tablet} {
    margin-bottom: 0;
  }
`;

export const BodyWrapper = styled.div`
  display: flex;
  flex: 1;
  max-width: 100vw;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;
  gap: 8px;

  ${BreakPoints.tablet} {
    flex-direction: column-reverse;
    gap: 12px;
    height: 100%;
    justify-content: flex-end;
    padding: 0;
  }
`;

export default Document;
