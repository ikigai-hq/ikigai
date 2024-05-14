import styled from "styled-components";
import usePageStore from "context/PageStore";

const PageTabContent = () => {
  const activePageId = usePageStore((state) => state.activePageId);
  const setActivePageId = usePageStore((state) => state.setActivePageId);

  return (
    <div>
      <PageContainer onClick={() => setActivePageId(undefined)}>
        <PageIndexContainer $active={!activePageId}>1</PageIndexContainer>
        <PagePreview $active={!activePageId} />
      </PageContainer>
      <PageContainer onClick={() => setActivePageId("page-uuid")}>
        <PageIndexContainer $active={!!activePageId}>
          <div>2</div>
        </PageIndexContainer>
        <PagePreview $active={!!activePageId} />
      </PageContainer>
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
