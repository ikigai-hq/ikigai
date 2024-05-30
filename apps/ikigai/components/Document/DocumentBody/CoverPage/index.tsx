import { useEffect } from "react";
import { Divider, Input } from "antd";
import { t } from "@lingui/macro";
import styled from "styled-components";
import { useDebounce } from "ahooks";

import useDocumentStore from "store/DocumentStore";
import CoverPhotoHeader from "./CoverPhotoHeader";
import UseUpdateDocument from "hook/UseUpdateDocument";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission, DocumentType } from "graphql/types";
import DocumentIconHeader from "./DocumentIconHeader";
import FolderCoverPageBody from "./FolderCoverPageBody";
import AssignmentCoverPageBody from "./AssignmentCoverPageBody";

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
  const isFolder = useDocumentStore((state) => state.isFolder);
  const documentType = useDocumentStore(
    (state) => state.activeDocument?.documentType,
  );

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
      <div style={{ padding: 20, display: "flex", alignItems: "center" }}>
        {!isFolder && (
          <div>
            <DocumentIconHeader />
          </div>
        )}
        <div style={{ flex: 1 }}>
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
      <Divider style={{ margin: 0 }} />
      <div style={{ paddingLeft: 20, paddingRight: 20 }}>
        {isFolder && <FolderCoverPageBody />}
        {documentType === DocumentType.ASSIGNMENT && (
          <AssignmentCoverPageBody />
        )}
      </div>
    </div>
  );
};

export const DocumentTitle = styled(Input.TextArea)`
  &&& {
    font-size: 28px;
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
