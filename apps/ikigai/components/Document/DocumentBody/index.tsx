import styled from "styled-components";
import { Separator } from "@radix-ui/themes";

import CoverPage from "./CoverPage";
import usePageStore from "store/PageStore";
import ContentPage from "./ContentPage";
import BottomPageList from "./BottomPageList";
import Loading from "components/Loading";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import ContentToolbar from "./ContentPage/ContentToolbar";
import useUIStore from "store/UIStore";
import Grading from "./Grading";

export type DocumentBodyProps = {
  loading: boolean;
};

const DocumentBody = ({ loading }: DocumentBodyProps) => {
  const allow = usePermission();
  const hideHeader = useUIStore((state) => state.config.hideHeader);
  const isFolder = useDocumentStore((state) => state.isFolder);
  const activePageId = usePageStore((state) => state.activePageId);
  const page = usePageStore((state) =>
    state.pages.find((p) => p.id === state.activePageId),
  );
  const uiConfig = useUIStore((state) => state.config);

  const showBottomPage =
    !isFolder && allow(DocumentActionPermission.VIEW_PAGE_CONTENT);
  const showContentToolbar =
    allow(DocumentActionPermission.EDIT_DOCUMENT) && activePageId;

  let editorReducedHeight = 0;
  if (showBottomPage) editorReducedHeight += 45;
  if (showContentToolbar) editorReducedHeight += 46;
  if (!hideHeader) editorReducedHeight += 50;

  let bodyReduceWidth = 0;
  if (uiConfig.hideLeftSide) bodyReduceWidth += 51;
  if (uiConfig.showGrading) bodyReduceWidth += 300;

  return (
    <Container>
      {showContentToolbar && (
        <>
          <ContentToolbar />
          <Separator style={{ width: "100%" }} />
        </>
      )}
      <Body $editorReducedHeight={editorReducedHeight}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: `calc(100vw - ${bodyReduceWidth}px)`,
            flex: 1,
            overflowY: !activePageId ? "auto" : "unset",
          }}
        >
          {loading && <Loading />}
          {!loading && !activePageId && <CoverPage />}
          {!loading && activePageId && page && (
            <ContentPage key={page?.id} page={page} />
          )}
        </div>
        {uiConfig.showGrading && <Grading />}
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
  $editorReducedHeight: number;
}>`
  width: 100%;
  background: #ffff;
  box-sizing: border-box;
  display: flex;
  height: ${(props) => `calc(100vh - ${props.$editorReducedHeight}px)`};
  overflow: hidden;
`;

export default DocumentBody;
