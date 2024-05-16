import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { BreakPoints } from "styles/mediaQuery";
import LeftSide from "./LeftSide";
import DocumentBody from "./DocumentBody";
import RightSide from "./RightSide";
import { useLoadDocument } from "hook/UseLoadDocumentV2";
import useDocumentStore from "../../context/DocumentStore";
import DocumentHeader from "./DocumentHeader";

const Document = () => {
  const router = useRouter();
  const documentId = router.query.documentId as string;
  const isFolder = useDocumentStore((state) => state.isFolder);

  const { loading } = useLoadDocument(documentId);

  return (
    <Container>
      <DocumentHeader />
      <DocumentBodyContainer>
        <BodyWrapper>
          <LeftSide />
          <DocumentBody loading={loading} />
          {!isFolder && <RightSide />}
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
