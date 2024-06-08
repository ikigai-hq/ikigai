import { Separator } from "@radix-ui/themes";
import React from "react";
import SpaceDocumentList from "components/Document/LeftSide/LeftSecondarySide/SpaceDocumentList";
import styled from "styled-components";
import useUIStore, { LeftSideBarOptions } from "store/UIStore";

const LeftSecondarySide = () => {
  const leftSidebar = useUIStore((state) => state.config.leftSidebar);
  const expanded = leftSidebar !== LeftSideBarOptions.None;
  return (
    <>
      <Container $hide={!expanded}>
        {leftSidebar === LeftSideBarOptions.Content && <SpaceDocumentList />}
      </Container>
      {expanded && <Separator style={{ height: "100vh", width: 1 }} />}
    </>
  );
};

const Container = styled.div<{ $hide?: boolean }>`
  width: 250px;
  display: ${({ $hide }) => ($hide ? "none" : "flex")};
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
  height: 100%;
  flex-direction: column;
`;

export default LeftSecondarySide;
