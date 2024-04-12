import React from "react";

import { Layout as LayoutAntd } from "antd";
import styled from "styled-components";

import { Header } from "components/Header";

import { SideMenu } from "./SideMenu";

const { Content } = LayoutAntd;

const LayoutContainer = styled.div`
  display: flex;
  background: #fcfaf4;
  gap: 0;
`;

const StyledSider = styled.div`
  height: 100vh;
  position: relative;
  z-index: 3;
  box-sizing: border-box;
`;

const SideMenuContainer = styled.div`
  border: 1px solid var(--gray-4,#eaecef);
  background: rgba(255,255,255,1);
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
`;

const StyledContent = styled(Content) <{
  background?: string;
  $removePadding?: boolean;
}>`
  & {
    overflow: auto;
    height: 100vh;
    background-color: ${(props) => props.background};
    display: flex;
    flex-direction: column;
    padding: 75px 15px 15px;

    background: #fcfaf4;
    border: ${(props) => `1px solid ${props.theme.colors.gray[3]}`};
    border-radius: 8px;
  }
`;

interface Props {
  children: React.ReactNode;
  background?: string;
  removePadding?: boolean;
}

export const Layout: React.FC<Props> = ({
  children,
  removePadding,
}) => {
  return (
    <LayoutContainer>
      <StyledSider>
        <SideMenu />
      </StyledSider>
      <LayoutAntd style={{ background: '#fcfaf4', maxHeight: '100vh' }}>
        <Header />
        <StyledContent $removePadding={removePadding}>
          {children}
        </StyledContent>
      </LayoutAntd>
    </LayoutContainer>
  );
};
