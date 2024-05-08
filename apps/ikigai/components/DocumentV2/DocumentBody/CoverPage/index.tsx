import { useEffect } from "react";
import { Divider, Input } from "antd";
import { t } from "@lingui/macro";
import styled from "styled-components";
import { useDebounce } from "ahooks";
import { useMutation } from "@apollo/client";

import { BreakPoints } from "styles/mediaQuery";
import useDocumentStore from "context/DocumentV2Store";
import CoverHeader from "./CoverHeader";
import { UPDATE_DOCUMENT } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import { UpdateDocumentData } from "graphql/types";

const CoverPage = () => {
  const [updateDocumentServer] = useMutation(UPDATE_DOCUMENT, {
    onError: handleError,
  });
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const activeDocumentTitle = useDocumentStore(
    (state) => state.activeDocument?.title,
  );
  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const updateActiveDocument = useDocumentStore(
    (state) => state.updateActiveDocument,
  );
  const updateSpaceDocument = useDocumentStore(
    (state) => state.updateSpaceDocument,
  );
  const debouncedTitle = useDebounce(activeDocumentTitle, { wait: 500 });

  useEffect(() => {
    const updateDocumentData: UpdateDocumentData = {
      title: debouncedTitle || "",
      coverPhotoId: activeDocument.coverPhotoId,
      editorConfig: activeDocument.editorConfig,
      body: activeDocument.body,
    };
    updateDocumentServer({
      variables: {
        documentId: activeDocumentId,
        data: updateDocumentData,
      },
    });
  }, [debouncedTitle]);

  const changeTitle = (value: string) => {
    updateActiveDocument({ title: value });
    updateSpaceDocument(activeDocumentId, { title: value });
  };

  return (
    <div>
      <CoverHeader />
      <div style={{ padding: 20 }}>
        <DocumentTitle
          autoSize
          variant="borderless"
          maxLength={255}
          value={activeDocumentTitle}
          onChange={(e) => changeTitle(e.currentTarget.value)}
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
