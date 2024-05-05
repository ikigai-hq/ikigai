import styled from "styled-components";
import Head from "next/head";
import React, { useState } from "react";
import { Skeleton } from "antd";
import { useRouter } from "next/router";

import CustomRichMarkdownEditor from "../common/RichMarkdownEditor/RichMarkdownEditor";
import useDocumentStore from "context/ZustandDocumentStore";
import {
  DocumentActionPermission,
  GetDocumentDetail_documentGet as IDocument,
} from "graphql/types";
import { DEFAULT_LEFT_SIDE_WIDTH, DEFAULT_RIGHT_SIDE_WIDTH } from "../../util";
import useSupportMobile from "hook/UseSupportMobile";
import useQuizStore from "context/ZustandQuizStore";
import usePageBlockStore from "context/ZustandPageBlockStore";
import DocumentSetting from "./DocumentSetting";
import useHighlightStore from "context/ZustandHighlightStore";
import usePermission from "hook/UsePermission";
import {
  DividerDocument,
  DocumentBody,
  EDITOR_ID,
  ExportDocument,
} from "./common";

export type EditorBodyProps = {
  document: IDocument;
  isReadOnly?: boolean;
  isViewInMobileApp?: boolean;
  isPreviewMode?: boolean;
  isNestedDoc?: boolean;
};

const Editor = ({
  document,
  isReadOnly,
  isViewInMobileApp,
  isPreviewMode,
  isNestedDoc,
}: EditorBodyProps) => {
  const router = useRouter();
  const currentDocIdQuery = router.query.documentId as string;
  const documentId = document.id;
  const update = useDocumentStore((state) => state.update);
  const allow = usePermission();
  const syncPageBlocks = usePageBlockStore((state) => state.syncPageBlocks);
  const syncQuizzes = useQuizStore((state) => state.syncQuizzes);
  const leftPanelHidden = useDocumentStore((state) => state.leftPanelHidden);
  const rightPanelHidden = useDocumentStore((state) => state.rightPanelHidden);
  const setFeedback = useDocumentStore((state) => state.setFeedback);
  const syncHighlights = useHighlightStore((state) => state.syncHighlights);
  const { isMobileView } = useSupportMobile();
  const loadingDocumentMaterial = useDocumentStore(
    (state) => state.loadingDocumentMaterial,
  );

  const [isFocusAtStart, setIsFocusAtStart] = useState(false);

  const isReadOnlyFinal =
    !allow(DocumentActionPermission.EDIT_DOCUMENT) || isReadOnly;

  const onChangeDocument = (value: string) => {
    if (isReadOnlyFinal) return;
    if (currentDocIdQuery !== documentId && !isNestedDoc) return;
    setFeedback(value);
    update(documentId, { body: value });
    syncPageBlocks(value, documentId);
    syncQuizzes(value, documentId);
    syncHighlights(value, documentId);
  };

  // This fn will catch control + s => trigger call api to save data
  const onSave = () => {
    useDocumentStore.getState().update(documentId, {});
  };

  if (
    !document ||
    loadingDocumentMaterial ||
    (currentDocIdQuery !== document.id && !isPreviewMode && !isNestedDoc)
  ) {
    return (
      <DocumentContainer>
        <DocumentBody $isPublishedPage={isPreviewMode}>
          <Skeleton />
        </DocumentBody>
      </DocumentContainer>
    );
  }

  return (
    <DocumentContainer
      $isNestedDoc={isNestedDoc}
      $isPublishedPage={isPreviewMode}
      $maxWidth={
        isMobileView
          ? 0
          : (!leftPanelHidden ? DEFAULT_LEFT_SIDE_WIDTH : 0) +
            (!rightPanelHidden ? DEFAULT_RIGHT_SIDE_WIDTH : 0)
      }
    >
      <DocumentBody
        $isNestedDoc={isNestedDoc}
        $isViewInMobile={isViewInMobileApp}
      >
        <ExportDocument id={EDITOR_ID} $isNestedDoc={isNestedDoc}>
          {!isViewInMobileApp && (
            <>
              <Head>
                <title>{document.title || ""} - ikigai</title>
              </Head>
              {!isNestedDoc && (
                <>
                  <DocumentSetting
                    isNestedDoc={isNestedDoc}
                    isReadOnly={isReadOnly}
                    document={document}
                    isPublishedPage={isPreviewMode}
                    setIsFocusAtStart={setIsFocusAtStart}
                  />
                  <DividerDocument />
                </>
              )}
            </>
          )}
          <CustomRichMarkdownEditor
            isViewInMobileApp={isViewInMobileApp || isPreviewMode}
            documentId={documentId}
            defaultVal={document.body}
            handleOnChange={onChangeDocument}
            isFocusAtStart={isFocusAtStart}
            readOnly={isReadOnlyFinal}
            onSave={onSave}
            isNestedDoc={isNestedDoc}
          />
        </ExportDocument>
      </DocumentBody>
    </DocumentContainer>
  );
};

export const DocumentContainer = styled.div<{
  $isPublishedPage?: boolean;
  $maxWidth?: number;
  $isNestedDoc?: boolean;
}>`
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 100%;
  position: relative;
  height: 100%;
  overflow: ${(props) => (props.$isPublishedPage ? "auto" : undefined)};
`;

export default Editor;
