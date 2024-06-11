import { useEffect, useState } from "react";
import styled from "styled-components";
import { t } from "@lingui/macro";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { DocumentActionPermission } from "graphql/types";
import usePermission from "hook/UsePermission";
import Editor from "components/Editor";
import { IPage } from "store/PageStore";
import { useDebounce } from "ahooks";
import useUpdatePage from "hook/UseUpdatePage";
import usePageContentStore from "store/PageContentStore";
import useUIStore, { LeftSideBarOptions, UIConfig } from "store/UIStore";
import { Separator } from "@radix-ui/themes";
import ContentToolbar from "./ContentToolbar";

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
  const [title, setTitle] = useState(page.title);
  const debouncedTitle = useDebounce(title, { wait: 500 });
  const { upsert } = useUpdatePage(page.id);

  useEffect(() => {
    upsert({
      title: debouncedTitle,
    });
  }, [debouncedTitle]);

  return (
    <div>
      <ContentToolbar />
      <Separator style={{ width: "100%" }} />
      <div style={{ padding: "10px 15px" }}>
        <PageTitle
          maxLength={255}
          placeholder={t`Type page name...`}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          readOnly={!allow(DocumentActionPermission.EDIT_DOCUMENT)}
        />
      </div>
      <div style={{ width: getBodyWidth(uiConfig) }}>
        <PanelGroup direction="horizontal">
          {pageContents.map((pageContent, index) => (
            <>
              <Panel key={pageContent.id} minSize={30}>
                <Editor
                  readOnly={!allow(DocumentActionPermission.EDIT_DOCUMENT)}
                  pageContent={pageContent}
                />
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
    </div>
  );
};

export const PageTitle = styled.input`
  &&& {
    font-size: 20px;
    font-weight: 700;
    padding-left: 0;
    overflow: hidden;
    line-height: normal;
    border: none;
    width: 100%;

    &:focus {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }
  }
`;

export default ContentPage;
