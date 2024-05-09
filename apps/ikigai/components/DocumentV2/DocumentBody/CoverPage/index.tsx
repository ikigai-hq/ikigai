import { useEffect } from "react";
import { Divider, Input } from "antd";
import { t } from "@lingui/macro";
import styled from "styled-components";
import { useDebounce } from "ahooks";

import { BreakPoints } from "styles/mediaQuery";
import useDocumentStore from "context/DocumentV2Store";
import CoverPhotoHeader from "./CoverPhotoHeader";
import UseUpdateDocument from "hook/UseUpdateDocument";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import DocumentIconHeader from "./DocumentIconHeader";

const CoverPage = () => {
  const allow = usePermission();
  const updateActiveDocumentServer = UseUpdateDocument();
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const activeDocumentTitle = useDocumentStore(
    (state) => state.activeDocument?.title,
  );
  const updateActiveDocument = useDocumentStore(
    (state) => state.updateActiveDocument,
  );
  const updateSpaceDocument = useDocumentStore(
    (state) => state.updateSpaceDocument,
  );
  const debouncedTitle = useDebounce(activeDocumentTitle, { wait: 500 });

  useEffect(() => {
    if (debouncedTitle) {
      updateActiveDocumentServer({ title: debouncedTitle });
    }
  }, [debouncedTitle]);

  const changeTitle = (value: string) => {
    updateActiveDocument({ title: value });
    updateSpaceDocument(activeDocumentId, { title: value });
  };

  return (
    <div>
      <CoverPhotoHeader />
      <div style={{ padding: 20, display: "flex", alignItems: "center" }}>
        <div>
          <DocumentIconHeader />
        </div>
        <div>
          <DocumentTitle
            autoSize
            variant="borderless"
            maxLength={255}
            value={activeDocumentTitle}
            onChange={(e) => changeTitle(e.currentTarget.value)}
            placeholder={t`Untitled`}
            readOnly={!allow(DocumentActionPermission.EDIT_DOCUMENT)}
          />
        </div>
      </div>
      <Divider />
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
  }
`;

export default CoverPage;
