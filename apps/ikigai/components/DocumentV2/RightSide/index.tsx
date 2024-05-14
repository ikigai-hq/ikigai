import React from "react";
import styled from "styled-components";
import { Divider, Typography } from "antd";

import { BreakPoints } from "styles/mediaQuery";
import { PageLayoutIcon } from "components/common/IconSvg";
import PageTabContent from "./PageTabContent";

const RightSide = () => {
  return (
    <Container $hide={false}>
      <div style={{ width: "100%", overflow: "auto" }}>
        <SpaceInfoContainer>
          <MenuContainer>
            <MenuItemContainer>
              <PageLayoutIcon />
              <Typography.Text>Pages</Typography.Text>
            </MenuItemContainer>
          </MenuContainer>
          <Divider style={{ margin: 0 }} />
          <PageTabContent />
        </SpaceInfoContainer>
      </div>
    </Container>
  );
};

export default RightSide;

const MenuItemContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  height: 56px;
  gap: 8px;
  cursor: pointer;
  padding-left: 10px;
  padding-right: 10px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;

  &:hover {
    background: ${(props) => props.theme.colors.gray[4]};
  }
`;

const MenuContainer = styled.div`
  width: 100%;
  display: flex;
`;

const SpaceInfoContainer = styled.div`
  padding: 5px;
`;

const Container = styled.div<{
  $hide: boolean;
}>`
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
