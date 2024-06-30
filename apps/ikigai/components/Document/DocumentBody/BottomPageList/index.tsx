import { Button, DropdownMenu, ScrollArea } from "@radix-ui/themes";
import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { v4 } from "uuid";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";
import { IconColumns1, IconColumns2 } from "@tabler/icons-react";

import {
  AddOrUpdatePage,
  DocumentActionPermission,
  PageInput,
  PageLayout,
} from "graphql/types";
import usePageStore from "store/PageStore";
import usePageContentStore from "store/PageContentStore";
import { ADD_OR_UPDATE_PAGE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "store/DocumentStore";
import PageItem from "./PageItem";
import usePermission from "hook/UsePermission";
import Dropdown from "components/base/Dropdown";
import useUIStore from "store/UIStore";

const BottomPageList = () => {
  const allow = usePermission();
  const uiConfig = useUIStore((state) => state.config);
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const pages = usePageStore((state) => state.pages);
  const addPage = usePageStore((state) => state.addPage);
  const addPageContent = usePageContentStore((state) => state.addPageContent);
  const setActivePageId = usePageStore((state) => state.setActivePageId);

  const [addOrUpdatePage, { loading }] = useMutation<AddOrUpdatePage>(
    ADD_OR_UPDATE_PAGE,
    {
      onError: handleError,
    },
  );

  const onAddPage = async (isSinglePage: boolean) => {
    const index = pages.length
      ? Math.max(...pages.map((page) => page.index)) + 1
      : 1;

    const pageInput: PageInput = {
      id: v4(),
      documentId: activeDocumentId,
      index,
      title: "New Page",
      layout: PageLayout.HORIZONTAL,
    };

    const { data } = await addOrUpdatePage({
      variables: {
        page: pageInput,
        isSinglePage,
      },
    });

    if (data) {
      addPage(data.documentAddOrUpdatePage);
      data.documentAddOrUpdatePage.pageContents.forEach(addPageContent);
      setActivePageId(data.documentAddOrUpdatePage.id);
    }
  };

  return (
    <PagesListContainer>
      <ScrollArea scrollbars="horizontal">
        <div style={{ display: "flex", gap: 5, padding: 5 }}>
          {uiConfig.showInformationPage && <PageItem />}
          {pages
            .sort((a, b) => a.index - b.index)
            .map((page, index) => (
              <PageItem index={index + 1} page={page} key={page.id} />
            ))}
        </div>
      </ScrollArea>
      {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
        <div
          style={{
            display: "flex",
            padding: 5,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Dropdown
            content={
              <div style={{ padding: 5 }}>
                <DropdownMenu.Item onClick={() => onAddPage(true)}>
                  <IconColumns1 stroke={1} /> Single layout
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => onAddPage(false)}>
                  <IconColumns2 stroke={1} /> Split layout
                </DropdownMenu.Item>
              </div>
            }
          >
            <Button radius="none" disabled={loading} loading={loading}>
              <PlusIcon /> Page
            </Button>
          </Dropdown>
        </div>
      )}
    </PagesListContainer>
  );
};

const PagesListContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  height: 45px;
  background-color: var(--gray-3);
`;

export default BottomPageList;
