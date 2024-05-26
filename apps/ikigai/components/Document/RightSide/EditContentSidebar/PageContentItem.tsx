import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { t } from "@lingui/macro";

import usePageStore, { IPage } from "store/PageStore";
import { RemovePage } from "graphql/types";
import { REMOVE_PAGE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { Dropdown, MenuProps, Typography } from "antd";
import Image from "next/image";
import useDocumentStore from "store/DocumentStore";
import usePageContentStore from "store/PageContentStore";
import { IconColumns1, IconColumns2 } from "@tabler/icons-react";

export type PageContentItemProps = {
  index: number;
  page?: IPage;
};

const PageContentItem = ({ page, index }: PageContentItemProps) => {
  const activeDocumentPhoto = useDocumentStore(
    (state) => state.activeDocument?.coverPhotoUrl,
  );
  const activePageId = usePageStore((state) => state.activePageId);
  const pages = usePageStore((state) => state.pages);
  const setActivePageId = usePageStore((state) => state.setActivePageId);
  const removePageInStore = usePageStore((state) => state.removePage);
  const pageContents = usePageContentStore((state) =>
    state.pageContents.filter((content) => content.pageId === page?.id),
  );

  const [removePage] = useMutation<RemovePage>(REMOVE_PAGE, {
    onError: handleError,
  });

  const onClickRemove = async () => {
    const { data } = await removePage({ variables: { pageId: page.id } });

    if (data) {
      removePageInStore(page.id);
      if (activePageId === page.id) {
        setActivePageId(undefined);
      }
    }
  };

  const onClickSetActivePageId = () => {
    const findingPage = pages.find((p) => page?.id === p.id);
    if (findingPage) setActivePageId(page.id);
  };

  const items: MenuProps["items"] = [
    {
      key: "remove",
      danger: true,
      label: t`Remove page`,
      onClick: onClickRemove,
    },
  ];

  if (!page) {
    // It's cover page
    return (
      <Dropdown trigger={["contextMenu"]} menu={{ items: [] }}>
        <PageContainer onClick={() => setActivePageId(undefined)}>
          <PageIndexContainer $active={!activePageId}>1</PageIndexContainer>
          <PagePreview $active={!activePageId} style={{ position: "relative" }}>
            {activeDocumentPhoto && (
              <Image
                alt="cover-page-photo"
                src={activeDocumentPhoto}
                layout="fill"
                objectFit="cover"
                style={{ borderRadius: "6px" }}
              />
            )}
          </PagePreview>
        </PageContainer>
      </Dropdown>
    );
  }

  return (
    <Dropdown trigger={["contextMenu"]} menu={{ items }}>
      <PageContainer onClick={onClickSetActivePageId}>
        <PageIndexContainer $active={activePageId === page.id}>
          {index}
        </PageIndexContainer>
        <PagePreview $active={activePageId === page.id}>
          <PagePreviewTitleContainer>
            <Typography.Text type="secondary" strong>
              {page.title}
            </Typography.Text>
            {pageContents.length === 1 && <IconColumns1 size={16} />}
            {pageContents.length > 1 && <IconColumns2 size={16} />}
          </PagePreviewTitleContainer>
        </PagePreview>
      </PageContainer>
    </Dropdown>
  );
};

const PagePreviewTitleContainer = styled.div`
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageIndexContainer = styled.div<{ $active?: boolean }>`
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${(props) =>
    props.$active ? props.theme.colors.primary[5] : "black"};
`;

const PagePreview = styled.div<{ $active?: boolean }>`
  flex: 1;
  border-radius: 8px;
  height: 90px;
  background: ${(props) => props.theme.colors.gray[2]};
  border: 2px solid
    ${(props) => (props.$active ? props.theme.colors.primary[5] : "white")};
  overflow: hidden;
`;

const PageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  margin-top: 10px;
`;

export default PageContentItem;
