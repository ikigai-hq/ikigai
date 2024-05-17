import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { t } from "@lingui/macro";

import usePageStore, { IPage } from "context/PageStore";
import { RemovePage } from "graphql/types";
import { REMOVE_PAGE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { Dropdown, MenuProps } from "antd";

export type PageContentItemProps = {
  index: number;
  page?: IPage;
};

const PageContentItem = ({ page, index }: PageContentItemProps) => {
  const activePageId = usePageStore((state) => state.activePageId);
  const pages = usePageStore((state) => state.pages);
  const setActivePageId = usePageStore((state) => state.setActivePageId);
  const removePageInStore = usePageStore((state) => state.removePage);

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
          <PagePreview $active={!activePageId} />
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
        <PagePreview $active={activePageId === page.id} />
      </PageContainer>
    </Dropdown>
  );
};

const PageIndexContainer = styled.div<{ $active?: boolean }>`
  width: 38px;
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
  background: ${(props) => props.theme.colors.primary[3]};
  border: 2px solid
    ${(props) => (props.$active ? props.theme.colors.primary[5] : "white")};
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
