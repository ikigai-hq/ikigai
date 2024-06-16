import React, { useRef } from "react";
import styled from "styled-components";

import SpaceDocumentList from "components/Document/LeftSide/LeftSecondarySide/SpaceDocumentList";
import useUIStore, { LeftSideBarOptions } from "store/UIStore";

const LeftSecondarySide = () => {
  const ref = useRef<HTMLDivElement>();
  const leftSidebar = useUIStore((state) => state.config.leftSidebar);
  const expanded = leftSidebar !== LeftSideBarOptions.None;

  return (
    <Container ref={ref} $hide={!expanded}>
      {leftSidebar === LeftSideBarOptions.Content && <SpaceDocumentList />}
    </Container>
  );
};

const Container = styled.div<{ $hide?: boolean }>`
  position: fixed;
  left: 53px;
  z-index: 3;
  display: ${(props) => (props.$hide ? "none" : "block")};
  width: 300px;
  background: white;
  box-sizing: border-box;
  height: 100%;
  flex-direction: column;
  box-shadow: 7px 1px 9px 0px rgba(0, 0, 0, 0.05);
  -webkit-box-shadow: 7px 1px 9px 0px rgba(0, 0, 0, 0.05);
  -moz-box-shadow: 7px 1px 9px 0px rgba(0, 0, 0, 0.05);
`;

export default LeftSecondarySide;
