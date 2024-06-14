import styled from "styled-components";
import { Separator } from "@radix-ui/themes";

import CoverPage from "./CoverPage";
import usePageStore from "store/PageStore";
import ContentPage from "./ContentPage";
import BottomPageList from "./BottomPageList";
import Loading from "components/Loading";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import useDocumentStore from "../../../store/DocumentStore";
import ContentToolbar from "./ContentPage/ContentToolbar";
import { t } from "@lingui/macro";
import { PageTitle } from "../DocumentHeader";
import { useEffect, useState } from "react";
import { useDebounce } from "ahooks";
import useUpdatePage from "hook/UseUpdatePage";

export type DocumentBodyProps = {
  loading: boolean;
};

const DocumentBody = ({ loading }: DocumentBodyProps) => {
  const allow = usePermission();
  const isFolder = useDocumentStore((state) => state.isFolder);
  const activePageId = usePageStore((state) => state.activePageId);
  const page = usePageStore((state) =>
    state.pages.find((p) => p.id === state.activePageId),
  );
  const [pageTitle, setPageTitle] = useState(page?.title);

  const debouncedTitle = useDebounce(pageTitle, { wait: 500 });
  const { upsert } = useUpdatePage(page?.id);

  useEffect(() => {
    if (page) {
      upsert({
        title: debouncedTitle,
      });
    }
  }, [debouncedTitle]);

  useEffect(() => {
    setPageTitle(page?.title);
  }, [page]);

  const showBottomPage =
    !isFolder && allow(DocumentActionPermission.VIEW_PAGE_CONTENT);
  const showPageTitle = !!page;
  const showContentToolbar =
    allow(DocumentActionPermission.EDIT_DOCUMENT) && activePageId;

  let editorReducedWidth = 0;
  if (showBottomPage) editorReducedWidth += 45;
  if (showPageTitle) editorReducedWidth += 46;
  if (showContentToolbar) editorReducedWidth += 48;

  return (
    <Container>
      {showPageTitle && (
        <div style={{ padding: "10px" }}>
          <PageTitle
            maxLength={255}
            placeholder={t`Type page name...`}
            value={pageTitle}
            onChange={(e) => setPageTitle(e.currentTarget.value)}
            readOnly={!allow(DocumentActionPermission.EDIT_DOCUMENT)}
          />
        </div>
      )}
      {showContentToolbar && (
        <>
          <Separator style={{ width: "100%" }} />
          <ContentToolbar />
          <Separator style={{ width: "100%" }} />
        </>
      )}
      <Body $editorReducedWidth={editorReducedWidth}>
        {loading && <Loading />}
        {!loading && !activePageId && <CoverPage />}
        {!loading && activePageId && page && (
          <ContentPage key={page?.id} page={page} />
        )}
      </Body>
      {showBottomPage && <BottomPageList />}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  max-width: 100%;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div<{
  $editorReducedWidth: number;
}>`
  width: 100%;
  background: #ffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: ${(props) => `calc(100vh - ${props.$editorReducedWidth}px - 50px)`};
  overflow: hidden;
`;

export default DocumentBody;
