import { useState } from "react";
import { Input } from "antd";
import { t } from "@lingui/macro";
import styled from "styled-components";

import { BreakPoints } from "styles/mediaQuery";

const CoverPage = () => {
  const [documentTitle, setDocumentTitle] = useState("");

  return (
    <div>
      <DocumentTitle
        autoSize
        variant="borderless"
        maxLength={255}
        value={documentTitle}
        onChange={(e) => setDocumentTitle(e.currentTarget.value)}
        placeholder={t`Untitled`}
      />
    </div>
  );
};

export const DocumentTitle = styled(Input.TextArea)<{ $fontSize?: number }>`
  &&& {
    font-size: ${(props) => props.$fontSize || 40}px;
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
      font-size: ${(props) => props.$fontSize || 32}px;
    }
  }
`;

export default CoverPage;
