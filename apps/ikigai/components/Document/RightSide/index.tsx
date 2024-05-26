import React from "react";
import styled from "styled-components";

import { BreakPoints } from "styles/mediaQuery";
import useUIStore, { RightSideBarOptions } from "store/UIStore";
import EditContentSidebar from "./EditContentSidebar";
import GradingSidebar from "./GradingSidebar";

const RightSide = () => {
  const config = useUIStore((state) => state.config);

  const isEditContentSidebarVisible =
    config.hasEditContentSidebar &&
    config.rightSideBarVisible === RightSideBarOptions.EditContent;
  const isGradingSidebarVisible =
    config.hasGradeSidebar &&
    config.rightSideBarVisible === RightSideBarOptions.Grading;
  const visible = isEditContentSidebarVisible || isGradingSidebarVisible;

  return (
    <Container $hide={!visible}>
      {isEditContentSidebarVisible && <EditContentSidebar />}
      {isGradingSidebarVisible && <GradingSidebar />}
    </Container>
  );
};

export default RightSide;

const Container = styled.div<{
  $hide: boolean;
}>`
  flex-direction: column;
  min-width: 250px;
  width: 250px;
  display: ${({ $hide }) => ($hide ? "none" : "flex")};
  border-radius: 8px;
  backdrop-filter: blur(12px);
  border: ${({ $hide }) =>
    $hide ? "none" : "1px solid var(--gray-4, #EAECEF)"};
  background: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
  height: 100%;

  ${BreakPoints.tablet} {
    box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
    width: 100%;
    height: auto;
  }
`;
