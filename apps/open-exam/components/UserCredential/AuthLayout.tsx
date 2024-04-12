import React from "react";

import { Col, Space } from "antd";
import styled, { useTheme } from "styled-components";
import { Trans } from "@lingui/macro";

import { BreakPoints } from "styles/mediaQuery";
import { Text, TextWeight } from "components/common/Text";
import RightIcon from "./RightIcon";
import LeftIcon from "./LeftIcon";
import { DesktopOnly } from "styles/styledCommon";
import Logo from "../Logo";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  margin: auto;
  overflow: hidden;
  background: #e5e5e5;
`;

const FormContainer = styled.div`
  padding: 36px 36px 24px 36px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;
  position: relative;
  z-index: 2;

  ${BreakPoints.tablet} {
    text-align: center;
    align-items: center;
    padding: 36px 20px 24px 20px;
  }
`;

const PositionRightIcon = styled.div`
  position: absolute;
  left: calc(50% + 257px);
  top: 230px;
`;

const PositionLeftIcon = styled.div`
  position: absolute;
  left: calc(50% - 257px - 175px);
  top: 663px;
  tranform: rotate(26.03deg);
`;

type LayoutManagementProps = {
  children: React.ReactNode;
};

export default function LayoutManagement({ children }: LayoutManagementProps) {
  const theme = useTheme();
  
  const logoSrc = "/logo.png";
  return (
    <Container>
      <FormContainer>
        <Logo src={logoSrc} />
        {children}
        <Col />
        <Space>
          <Text
            weight={TextWeight.medium}
            level={2}
            color={theme.colors.gray[6]}
            style={{ cursor: "pointer" }}
          >
            <Trans>Powered by Open Exam</Trans>
          </Text>
        </Space>
        <DesktopOnly>
          <PositionRightIcon>
            <RightIcon />
          </PositionRightIcon>
          <PositionLeftIcon>
            <LeftIcon />
          </PositionLeftIcon>
        </DesktopOnly>
      </FormContainer>
    </Container>
  );
}
