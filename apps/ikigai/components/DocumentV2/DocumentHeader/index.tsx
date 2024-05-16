import styled from "styled-components";
import { Typography } from "antd";

import useDocumentStore from "context/DocumentV2Store";

const DocumentHeader = () => {
  const activeDocumentTitle = useDocumentStore(
    (state) => state.activeDocument?.title,
  );
  const iconValue = useDocumentStore(
    (state) => state.activeDocument?.iconValue,
  );
  const isFolder = useDocumentStore((state) => state.isFolder);
  const icon = !isFolder ? iconValue || "✏️" : "📁";

  return (
    <DocumentHeaderWrapper>
      <StyledActionContainer>
        <StyledHeaderText ellipsis>
          {icon} {activeDocumentTitle || "Untitled"}
        </StyledHeaderText>
      </StyledActionContainer>
      <StyledActionContainer>Center of Header</StyledActionContainer>
      <StyledActionContainer>Right Part of Header</StyledActionContainer>
    </DocumentHeaderWrapper>
  );
};

const StyledHeaderText = styled(Typography.Text)`
  font-weight: 400;
  font-size: 16px;
  margin: 0;
`;

export const DocumentHeaderWrapper = styled.div`
  padding: 8px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
`;

const StyledActionContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-height: 28px;
  gap: 4px;
`;

export default DocumentHeader;
