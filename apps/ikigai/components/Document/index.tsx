import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { Trans } from "@lingui/macro";
import { Button } from "@radix-ui/themes";

import { BreakPoints } from "styles/mediaQuery";
import DocumentBody from "./DocumentBody";
import { useLoadDocument } from "hook/UseLoadDocument";
import DocumentHeader from "./DocumentHeader";
import LeftSide from "./LeftSide";
import useUIStore from "store/UIStore";

const Document = () => {
  const router = useRouter();
  const documentId = router.query.documentId as string;
  const config = useUIStore((state) => state.config);
  const setUiConfig = useUIStore((state) => state.setConfig);
  const isEmbed = useUIStore((state) => state.isEmbed);

  const onClickExitFocusMode = () => {
    setUiConfig({ hideLeftSide: false, hideHeader: false });
  };

  const { loading } = useLoadDocument(documentId);

  return (
    <Container>
      {!config.hideLeftSide && !isEmbed && <LeftSide />}
      <DocumentBodyContainer>
        {!config.hideHeader && <DocumentHeader />}
        <DocumentBody loading={loading} />
      </DocumentBodyContainer>
      {config.hideHeader && (
        <div style={{ position: "fixed", right: 10, top: 10 }}>
          <Button size="1" variant="soft" onClick={onClickExitFocusMode}>
            <Trans>Exit focus mode</Trans>
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
