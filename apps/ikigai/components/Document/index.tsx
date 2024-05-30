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

export const DocumentBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  height: 100vh;
  flex: 1;

  ${BreakPoints.tablet} {
    margin-bottom: 0;
  }
`;

export default Document;
