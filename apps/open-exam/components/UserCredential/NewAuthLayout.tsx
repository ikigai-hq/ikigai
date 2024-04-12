import React from "react";

import styled, { useTheme } from "styled-components";
import Image from "next/image";
import { Space } from "antd";
import { Text, TextWeight } from "components/common/Text";
import { Trans, t } from "@lingui/macro";

const AuthLayout = styled.div`
  background-color: ${(props) => props.theme.colors.gray[11]};
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 32px 0 16px 0;
  overflow: hidden;
`;

const FrameTopImage = styled.div`
  position: absolute;
  top: 15%;
  right: 15px;
  transform: translateX(100%);
`;

const FrameBottomImage = styled.div`
  position: absolute;
  bottom: 0;
  left: -120px;
`;

const Footer = styled(Space)`
  color: ${(props) => props.theme.colors.gray[6]};
`;

type LayoutManagementProps = {
  children: React.ReactNode;
};

export default function LayoutManagement({ children }: LayoutManagementProps) {
  const theme = useTheme();
  return (
    <AuthLayout>
      <Space size={52} direction="vertical" align="center">
        <Image alt="logo" src="/nlogo.svg" width="182" height="48" />
        <section style={{ position: "relative" }}>
          <FrameTopImage>
            <Image
              alt={t`welcome`}
              src="/access/bottom.svg"
              width="337"
              height="282"
            />
          </FrameTopImage>
          {children}
          <FrameBottomImage>
            <Image
              alt={t`welcome`}
              src="/access/top.svg"
              width="138"
              height="114"
            />
          </FrameBottomImage>
        </section>
      </Space>
      <Footer size={16}>
        <a>
          <Text color={theme.colors.gray[6]} weight={TextWeight.medium}>
            <Trans>Contact</Trans>
          </Text>
        </a>
        &#8226;
        <a>
          <Text color={theme.colors.gray[6]} weight={TextWeight.medium}>
            <Trans>Privacy & Terms</Trans>
          </Text>
        </a>
      </Footer>
    </AuthLayout>
  );
}
