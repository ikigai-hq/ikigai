import React, { useState } from "react";
import styled from "styled-components";
import { Trans } from "@lingui/macro";
import { Segmented } from "antd";
import { IconTools, IconPageBreak } from "@tabler/icons-react";

import { BreakPoints } from "styles/mediaQuery";
import PageTabContent from "./PageTabContent";

enum ContentOptions {
  Pages,
  Tools,
}

const RightSide = () => {
  const [contentTab, setContentTab] = useState(ContentOptions.Pages);
  const options = [
    {
      value: ContentOptions.Pages,
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
          }}
        >
          <IconPageBreak size={16} />
          <Trans>Pages</Trans>
        </div>
      ),
    },
    {
      value: ContentOptions.Tools,
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
          }}
        >
          <IconTools size={16} />
          <Trans>Tools</Trans>
        </div>
      ),
    },
  ];

  return (
    <Container $hide={false}>
      <div>
        <Segmented
          style={{ width: "100%" }}
          options={options}
          onChange={setContentTab}
          value={contentTab}
          block
        />
      </div>
      <div style={{ width: "100%", overflow: "auto" }}>
        {contentTab === ContentOptions.Pages && (
          <SpaceInfoContainer>
            <PageTabContent />
          </SpaceInfoContainer>
        )}
      </div>
    </Container>
  );
};

export default RightSide;

const SpaceInfoContainer = styled.div`
  padding: 5px;
`;

const Container = styled.div<{
  $hide: boolean;
}>`
  flex-direction: column;
  min-width: 250px;
  width: 250px;
  display: ${({ $hide }) => ($hide ? "none" : "flex")};
  border-radius: 8px;
  backdrop-filter: blur(12px);
  border: ${({ $hide }) =>
    $hide ? "none" : "1px solid var(--gray-4, #EAECEF)"};
  background: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
  height: 100%;

  ${BreakPoints.tablet} {
    box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
    width: 100%;
    height: auto;
  }
`;
