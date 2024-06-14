import styled from "styled-components";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { DocumentActionPermission } from "graphql/types";
import usePermission from "hook/UsePermission";
import Editor from "components/Editor";
import { IPage } from "store/PageStore";
import usePageContentStore from "store/PageContentStore";
import useUIStore, { LeftSideBarOptions, UIConfig } from "store/UIStore";

const getBodyWidth = (uiConfig: UIConfig) => {
  let bodyWidth = "100vw - 305px";
  // If left sidebar is not visible -> the side should be increase 256px
  if (uiConfig.leftSidebar === LeftSideBarOptions.None) bodyWidth += " + 250px";
  return `calc(${bodyWidth})`;
};

export type ContentPageProps = {
  page: IPage;
};

const ContentPage = ({ page }: ContentPageProps) => {
  const allow = usePermission();
  const uiConfig = useUIStore((state) => state.config);
  const pageContents = usePageContentStore((state) =>
    state.pageContents.filter((content) => content.pageId === page.id),
  ).sort((a, b) => a.index - b.index);

  return (
    <ContentPageWrapper>
      <div style={{ width: getBodyWidth(uiConfig), height: "100%" }}>
        <PanelGroup direction="horizontal">
          {pageContents.map((pageContent, index) => (
            <>
              <Panel key={pageContent.id} minSize={30}>
                <EditorWrapper>
                  <Editor
                    readOnly={!allow(DocumentActionPermission.EDIT_DOCUMENT)}
                    pageContent={pageContent}
                  />
                </EditorWrapper>
              </Panel>
              {index !== pageContents.length - 1 && (
                <PanelResizeHandle
                  style={{
                    width: "1px",
                    backgroundColor: "var(--gray-4)",
                  }}
                />
              )}
            </>
          ))}
        </PanelGroup>
      </div>
    </ContentPageWrapper>
  );
};

const ContentPageWrapper = styled.div`
  height: 100%;
  overflow: hidden;
`;

const EditorWrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

export default ContentPage;
