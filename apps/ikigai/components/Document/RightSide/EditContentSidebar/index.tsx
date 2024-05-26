import React, { useState } from "react";
import styled from "styled-components";
import { Trans } from "@lingui/macro";
import { Segmented } from "antd";
import { IconPageBreak, IconTools } from "@tabler/icons-react";

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
    <>
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
    </>
  );
};

export default RightSide;

const SpaceInfoContainer = styled.div`
  padding: 5px;
`;
