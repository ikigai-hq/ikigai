import { useRef } from "react";
import styled from "styled-components";
import { Divider, Input } from "antd";
import { t } from "@lingui/macro";

import { DocumentActionPermission } from "graphql/types";
import usePermission from "hook/UsePermission";
import TiptapEditor from "../Editor";

const ContentPage = () => {
  const allow = usePermission();
  const documentBodyRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div style={{ padding: 20 }}>
        <PageTitle
          autoSize
          variant="borderless"
          maxLength={255}
          placeholder={t`Untitled`}
          readOnly={!allow(DocumentActionPermission.EDIT_DOCUMENT)}
        />
      </div>
      <Divider style={{ margin: 0 }} />
      <div ref={documentBodyRef}>
        <TiptapEditor parentRef={documentBodyRef} />
      </div>
    </div>
  );
};

export const PageTitle = styled(Input.TextArea)`
  &&& {
    font-size: 20px;
    font-weight: 700;
    padding-left: 0;
    overflow: hidden;
    line-height: normal;

    &:focus {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }
  }
`;

export default ContentPage;
