import { Button, Dropdown } from "antd";
import { t, Trans } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import { v4 } from "uuid";
import { useTheme } from "styled-components";
import React from "react";

import usePageStore from "store/PageStore";
import { ADD_OR_UPDATE_PAGE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import {
  AddOrUpdatePage,
  DocumentActionPermission,
  PageInput,
  PageLayout,
} from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import PageContentItem from "./PageContentItem";
import { IconColumns1, IconColumns2 } from "@tabler/icons-react";
import usePageContentStore from "store/PageContentStore";
import { Text, TextWeight } from "components/common/Text";
import usePermission from "hook/UsePermission";

const PageTabContent = () => {
  const allow = usePermission();
  const theme = useTheme();
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const pages = usePageStore((state) => state.pages);
  const addPage = usePageStore((state) => state.addPage);
  const addPageContent = usePageContentStore((state) => state.addPageContent);

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
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 5 }}>
        <Text color={theme.colors.gray[6]} weight={TextWeight.medium} level={2}>
          <Trans>Pages</Trans>
        </Text>
      </div>
      {allow(DocumentActionPermission.EDIT_DOCUMENT) && (
        <Dropdown
          disabled={loading}
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "Single",
                label: t`Single page`,
                icon: <IconColumns1 />,
                onClick: () => onAddPage(true),
              },
              {
                key: "Double",
                label: t`Split page`,
                icon: <IconColumns2 />,
                onClick: () => onAddPage(false),
              },
            ],
          }}
        >
          <Button
            style={{ width: "100%" }}
            loading={loading}
            disabled={loading}
          >
            <Trans>Add page</Trans>
          </Button>
        </Dropdown>
      )}
      <PageContentItem index={1} />
      {pages
        .sort((a, b) => a.index - b.index)
        .map((page, index) => (
          <PageContentItem index={index + 2} key={page.id} page={page} />
        ))}
    </div>
  );
};

export default PageTabContent;
