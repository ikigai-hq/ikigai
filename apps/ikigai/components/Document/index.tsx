import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { BreakPoints } from "styles/mediaQuery";
import DocumentBody from "./DocumentBody";
import { useLoadDocument } from "hook/UseLoadDocument";
import DocumentHeader from "./DocumentHeader";
import LeftSide from "./LeftSide";
import useUIStore from "store/UIStore";
import { Button } from "@radix-ui/themes";

const Document = () => {
  const router = useRouter();
  const documentId = router.query.documentId as string;
  const isFocusMode = useUIStore((state) => state.config.focusMode);
  const setUiConfig = useUIStore((state) => state.setConfig);

  const onClickExitFocusMode = () => {
    setUiConfig({ focusMode: false });
  };

  const { loading } = useLoadDocument(documentId);

  return (
    <Container>
      {!isFocusMode && <LeftSide />}
      <DocumentBodyContainer>
        {!isFocusMode && <DocumentHeader />}
        <DocumentBody loading={loading} />
      </DocumentBodyContainer>
      {isFocusMode && (
        <div style={{ position: "fixed", right: 10, top: 10 }}>
          <Button size="1" variant="soft" onClick={onClickExitFocusMode}>
            Exit focus mode
          </Button>
        </div>
      )}
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
