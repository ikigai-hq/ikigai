import { useEffect } from "react";
import { t } from "@lingui/macro";
import styled from "styled-components";
import { useDebounce } from "ahooks";

import useDocumentStore from "store/DocumentStore";
import UseUpdateDocument from "hook/UseUpdateDocument";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission, DocumentType } from "graphql/types";
import FolderCoverPageBody from "./FolderCoverPageBody";
import AssignmentCoverPageBody from "./AssignmentCoverPageBody";

const CoverPage = () => {
  const allow = usePermission();
  const updateActiveDocumentServer = UseUpdateDocument();
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const activeDocumentTitle = useDocumentStore(
    (state) => state.activeDocument?.title,
  );
  const isDefaultPrivate = useDocumentStore(
    (state) => state.activeDocument?.isDefaultFolderPrivate,
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
    <div style={{ display: "flex", justifyContent: "center", padding: 10 }}>
      <div style={{ width: "100%" }}>
        <div>
          <DocumentTitle
            maxLength={255}
            value={activeDocumentTitle}
            onChange={(e) => changeTitle(e.currentTarget.value)}
            placeholder={t`Untitled`}
            readOnly={
              !allow(DocumentActionPermission.EDIT_DOCUMENT) || isDefaultPrivate
            }
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          {isFolder && <FolderCoverPageBody />}
          {documentType === DocumentType.ASSIGNMENT && (
            <AssignmentCoverPageBody />
          )}
        </div>
      </div>
    </div>
  );
};

export const DocumentTitle = styled.input`
  font-size: 28px;
  font-weight: 600;
  padding-left: 0;
  overflow: hidden;
  line-height: normal;
  background-color: white;
  color: black;
  border: none;
  width: 100%;
  resize: none;
  overflow-wrap: break-word;

  &:focus {
    outline: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
    --text-field-focus-color: white;
  }
`;

export default CoverPage;
