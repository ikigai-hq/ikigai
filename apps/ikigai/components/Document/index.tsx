import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { BreakPoints } from "styles/mediaQuery";
import DocumentBody from "./DocumentBody";
import { useLoadDocument } from "hook/UseLoadDocument";
import DocumentHeader from "./DocumentHeader";
import LeftSide from "./LeftSide";

const Document = () => {
  const router = useRouter();
  const documentId = router.query.documentId as string;

  const { loading } = useLoadDocument(documentId);

  return (
    <Container>
      <LeftSide />
      <DocumentBodyContainer>
        <DocumentHeader />
        <DocumentBody loading={loading} />
      </DocumentBodyContainer>
    </Container>
  );
};

export const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
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
  padding: 0 8px;
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
