import styled from "styled-components";
import { Typography } from "antd";
import { useTitle } from "ahooks";
import { IconLayoutSidebar, IconLayoutSidebarRight } from "@tabler/icons-react";

import useUIStore from "store/UIStore";
import useDocumentStore from "store/DocumentStore";
import { TextButtonWithHover } from "components/common/Button";
import SubmissionHeader from "./SubmissionHeader";

const DocumentHeader = () => {
  const setUIConfig = useUIStore((state) => state.setConfig);
  const uiConfig = useUIStore((state) => state.config);
  const activeDocumentTitle = useDocumentStore(
    (state) => state.activeDocument?.title,
  );
  const iconValue = useDocumentStore(
    (state) => state.activeDocument?.iconValue,
  );
  const isFolder = useDocumentStore((state) => state.isFolder);
  const icon = !isFolder ? iconValue || "✏️" : "📁";

  const title = `${activeDocumentTitle || "Untitled"} - Powered by Ikigai!`;
  useTitle(title);

  return (
    <DocumentHeaderWrapper>
      <StyledActionContainer>
        <div>
          {uiConfig.hasLeftSidebar && (
            <SideBarHeader
              type="text"
              icon={<IconLayoutSidebar size={22} stroke={1.5} />}
              onClick={() =>
                setUIConfig({
                  leftSidebarVisible: !uiConfig.leftSidebarVisible,
                })
              }
              $active={uiConfig.leftSidebarVisible}
            />
          )}
          <SubmissionHeader />
        </div>
      </StyledActionContainer>
      <StyledActionContainer style={{ justifyContent: "center" }}>
        <StyledHeaderText ellipsis>
          {icon} {activeDocumentTitle || "Untitled"}
        </StyledHeaderText>
      </StyledActionContainer>
      <StyledActionContainer style={{ justifyContent: "end" }}>
        <div>
          {uiConfig.hasRightSidebar && (
            <SideBarHeader
              type="text"
              icon={<IconLayoutSidebarRight size={22} stroke={1.5} />}
              onClick={() =>
                setUIConfig({
                  rightSidebarVisible: !uiConfig.rightSidebarVisible,
                })
              }
              $active={uiConfig.rightSidebarVisible}
            />
          )}
        </div>
      </StyledActionContainer>
    </DocumentHeaderWrapper>
  );
};

const SideBarHeader = styled(TextButtonWithHover)<{ $active?: boolean }>`
  background-color: ${(props) =>
    props.$active ? props.theme.colors.primary[1] : "none"};
`;

const StyledHeaderText = styled(Typography.Text)`
  font-weight: 500;
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
