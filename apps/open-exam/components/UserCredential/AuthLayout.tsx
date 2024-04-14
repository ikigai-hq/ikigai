import React from "react";

import { Col, Space } from "antd";
import styled, { useTheme } from "styled-components";
import { Trans } from "@lingui/macro";
import Link from "next/link";

import { BreakPoints } from "styles/mediaQuery";
import { Text, TextWeight } from "components/common/Text";
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

export const FormAuthContainer = styled.div`
  min-width: 200px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
  padding: 48px 48px 48px 48px;
  margin-top: 52px;
  margin-bottom: 52px;
  background: ${(props) => props.theme.colors.gray[0]};
  ${BreakPoints.tablet} {
    margin-top: 52px;
    margin-bottom: 48px;
  }

  ${BreakPoints.mobile} {
    width: 100%;
  }
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
        <FormAuthContainer>
          {children}
        </FormAuthContainer>
        <Col />
        <Space>
          <Link href="https://github.com/openexamhq/open-exam" target="_blank" rel="noopener noreferrer">
            <a>
              <Text
                weight={TextWeight.medium}
                level={2}
                color={theme.colors.gray[6]}
                style={{ cursor: "pointer" }}
              >
                <Trans>Powered by Open Exam</Trans>
              </Text>
            </a>
          </Link>
        </Space>
      </FormContainer>
    </Container>
  );
}
