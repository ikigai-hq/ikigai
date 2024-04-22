import { t } from "@lingui/macro";

import EmptyState from "components/EmptyState";

export type PreviewDocumentProps = {
  documentId?: number;
};

const PreviewDocument = ({ documentId }: PreviewDocumentProps) => {
  const documentPreviewUrl = documentId
    ? `${window.location.origin}/documents/${documentId}/preview?no-redirect=0`
    : undefined;

  if (!documentPreviewUrl) {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <EmptyState content={t`No document`} />
      </div>
    );
  }

  return (
    <iframe
      src={documentPreviewUrl}
      width="100%"
      height="100%"
      style={{
        borderTopRightRadius: "16px",
        borderBottomRightRadius: "16px",
      }}
      frameBorder="0"
    />
  );
};

export default PreviewDocument;
