import styled from "styled-components";
import { Tooltip } from "antd";
import { useTitle } from "ahooks";
import { IconChecklist, IconPencil } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { Text } from "@radix-ui/themes";

import useUIStore, { RightSideBarOptions } from "store/UIStore";
import useDocumentStore from "store/DocumentStore";
import { TextButtonWithHover } from "components/common/Button";
import SubmissionHeader from "./SubmissionHeader";

const DocumentHeader = () => {
  const setUIConfig = useUIStore((state) => state.setConfig);
  const uiConfig = useUIStore((state) => state.config);
  const activeDocumentTitle = useDocumentStore(
    (state) => state.activeDocument?.title,
  );

  const title = `${activeDocumentTitle || "Untitled"} - Powered by Ikigai!`;
  useTitle(title);

  return (
    <DocumentHeaderWrapper>
      <StyledActionContainer style={{ justifyContent: "start" }}>
        <Text size="2">{activeDocumentTitle || "Untitled"}</Text>
      </StyledActionContainer>
      <StyledActionContainer>
        <SubmissionHeader />
      </StyledActionContainer>
      <StyledActionContainer style={{ justifyContent: "end" }}>
        <div>
          {uiConfig.hasGradeSidebar && (
            <Tooltip title={t`Grade`} arrow={false}>
              <SideBarHeader
                type="text"
                icon={<IconChecklist size={22} stroke={1.5} />}
                onClick={() =>
                  setUIConfig({
                    rightSideBarVisible:
                      uiConfig.rightSideBarVisible ===
                      RightSideBarOptions.Grading
                        ? RightSideBarOptions.None
                        : RightSideBarOptions.Grading,
                  })
                }
                $active={
                  uiConfig.rightSideBarVisible === RightSideBarOptions.Grading
                }
              />
            </Tooltip>
          )}
          {uiConfig.hasEditContentSidebar && (
            <Tooltip title={t`Pages & Edit tools`} arrow={false}>
              <SideBarHeader
                type="text"
                icon={<IconPencil size={22} stroke={1.5} />}
                onClick={() =>
                  setUIConfig({
                    rightSideBarVisible:
                      uiConfig.rightSideBarVisible ===
                      RightSideBarOptions.EditContent
                        ? RightSideBarOptions.None
                        : RightSideBarOptions.EditContent,
                  })
                }
                $active={
                  uiConfig.rightSideBarVisible ===
                  RightSideBarOptions.EditContent
                }
              />
            </Tooltip>
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

export const DocumentHeaderWrapper = styled.div`
  padding: 8px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
  height: 52px;
`;

const StyledActionContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 4px;
`;

export default DocumentHeader;
