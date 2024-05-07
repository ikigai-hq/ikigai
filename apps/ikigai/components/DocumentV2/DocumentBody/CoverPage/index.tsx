import { useState } from "react";
import { Divider, Input } from "antd";
import { t } from "@lingui/macro";
import styled from "styled-components";

import { BreakPoints } from "styles/mediaQuery";
import useDocumentStore from "context/DocumentV2Store";
import CoverHeader from "./CoverHeader";

const CoverPage = () => {
  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const [documentTitle, setDocumentTitle] = useState(activeDocument.title);

  return (
    <div>
      <CoverHeader />
      <div style={{ padding: 20 }}>
        <DocumentTitle
          autoSize
          variant="borderless"
          maxLength={255}
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.currentTarget.value)}
          placeholder={t`Untitled`}
        />
        <Divider />
      </div>
    </div>
  );
};

export const DocumentTitle = styled(Input.TextArea)`
  &&& {
    font-size: 40px;
    font-weight: 700;
    padding-left: 0;
    overflow: hidden;
    line-height: normal;

    &:focus {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }

    ${BreakPoints.tablet} {
      font-size: 32px;
    }
  }
`;

export default CoverPage;
