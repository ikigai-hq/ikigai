import styled from "styled-components";
import { Button } from "antd";
import { Trans } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import { v4 } from "uuid";

import usePageStore from "context/PageStore";
import { ADD_OR_UPDATE_PAGE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { AddOrUpdatePage, PageInput, PageLayout } from "graphql/types";
import useDocumentStore from "context/DocumentV2Store";

const PageTabContent = () => {
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const activePageId = usePageStore((state) => state.activePageId);
  const setActivePageId = usePageStore((state) => state.setActivePageId);
  const pages = usePageStore((state) => state.pages);
  const addPage = usePageStore((state) => state.addPage);

  const [addOrUpdatePage, { loading }] = useMutation<AddOrUpdatePage>(
    ADD_OR_UPDATE_PAGE,
    {
      onError: handleError,
    },
  );

  const onAddPage = async () => {
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
      },
    });

    if (data) addPage(data.documentAddOrUpdatePage);
  };

  return (
    <div>
      <Button
        style={{ width: "100%", marginTop: "10px" }}
        onClick={onAddPage}
        loading={loading}
        disabled={loading}
      >
        <Trans>Add page</Trans>
      </Button>
      <PageContainer onClick={() => setActivePageId(undefined)}>
        <PageIndexContainer $active={!activePageId}>1</PageIndexContainer>
        <PagePreview $active={!activePageId} />
      </PageContainer>
      {pages.map((page, index) => (
        <PageContainer key={page.id} onClick={() => setActivePageId(page.id)}>
          <PageIndexContainer $active={activePageId === page.id}>
            {index + 2}
          </PageIndexContainer>
          <PagePreview $active={activePageId === page.id} />
        </PageContainer>
      ))}
    </div>
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
    ${(props) => (props.$active ? props.theme.colors.primary[5] : "none")};
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

export default PageTabContent;
