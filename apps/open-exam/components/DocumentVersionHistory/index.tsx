import styled from "styled-components";
import { useState } from "react";

import DocumentHistoryList from "./DocumentHistoryList";
import Modal from "../common/Modal";
import { GetDocumentHistoryVersions_documentGetHistoryVersions as IDocumentVersion} from "graphql/types";
import PreviewDocument from "components/PreviewDocument";

export type DocumentVersionHistoryProps = {
  documentId: number;
  visible: boolean;
  onClose: () => void;
};

const DocumentVersionHistory = ({ visible, onClose, documentId }: DocumentVersionHistoryProps) => {
  const [selectedVersion, onChangeSelectedVersion] = useState<IDocumentVersion | undefined>();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      width="97vw"
      centered
      padding="0"
    >
      <div style={{ height: "87vh", display: "flex" }}>
        <DocumentHistoryList
          documentId={documentId}
          selectedVersion={selectedVersion}
          onSelectVersion={onChangeSelectedVersion}
          onCancel={onClose}
        />
        <PreviewDocument
          documentId={selectedVersion?.versioningDocumentId}
        />
      </div>
    </Modal>
  );
};

export default DocumentVersionHistory;
