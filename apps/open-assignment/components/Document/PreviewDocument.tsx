import React from "react";
import styled from "styled-components";

import {
  BodyWrapper,
  Container,
  DocumentBodyContainer,
  DocumentHeaderWrapper,
} from "./common";
import Editor from "./Editor";
import { isMobileView } from "hook/UseSupportMobile";
import { GetDocumentDetail_documentGet as IDocument } from "graphql/types";
import useDocumentStore from "../../context/ZustandDocumentStore";
import usePageBlockStore from "context/ZustandPageBlockStore";
import { useLoadDocument } from "hook/UseLoadDocument";
import { ReviewPageBlocks } from "components/common/RichMarkdownEditor/extensions/PageBlockExtension/ReviewPageBlocks";
import Loading from "components/Loading";
import { Trans } from "@lingui/macro";

export type PreviewDocumentProps = {
  doc: IDocument;
  onlyWide?: boolean;
};

const PreviewDocument = ({ doc, onlyWide }: PreviewDocumentProps) => {
  useDocumentStore.setState({ isPreviewMode: true });
  const { error, loading } = useLoadDocument(doc.id);
  const pageblockData = usePageBlockStore((state) =>
    state.mapPageBlockData.get(doc.id),
  );

  if (loading) return <Loading />;

  if (isMobileView() && !onlyWide) {
    return (
      <Container>
        <div
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        >
          <Editor document={doc} isReadOnly isPreviewMode />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <DocumentHeaderWrapper>
        <DocumentBreadcrumbContainer>
          <DocumentBreadcrumb>{doc?.title}</DocumentBreadcrumb>
        </DocumentBreadcrumbContainer>
      </DocumentHeaderWrapper>
      <DocumentBodyContainer>
        {error ? (
          <Trans>Can not view this document</Trans>
        ) : (
          <BodyWrapper>
            {pageblockData?.length ? (
              <ReviewPageBlocks masterDocumentId={doc.id} />
            ) : (
              <Editor document={doc} isReadOnly isPreviewMode />
            )}
          </BodyWrapper>
        )}
      </DocumentBodyContainer>
    </Container>
  );
};

const DocumentBreadcrumb = styled.li`
  display: inline-block;
  cursor: pointer;
  border-radius: 4px;
  padding: 4px 8px;

  &:hover {
    background: var(--gray-3, #f4f5f7);
  }
`;

const DocumentBreadcrumbContainer = styled.ul`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
  flex: 1;
`;

export default PreviewDocument;
