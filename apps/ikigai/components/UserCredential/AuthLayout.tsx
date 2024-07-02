import React from "react";

import styled from "styled-components";
import { Trans } from "@lingui/macro";
import Link from "next/link";
import { Separator, Text } from "@radix-ui/themes";

import { BreakPoints } from "styles/mediaQuery";
import Logo from "../Logo";
import Config from "config/Config";

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
  margin-bottom: 26px;
  background: var(--gray-1);
  ${BreakPoints.tablet} {
    margin-top: 52px;
    margin-bottom: 24px;
  }

  ${BreakPoints.mobile} {
    width: 100%;
  }
`;

type LayoutManagementProps = {
  children: React.ReactNode;
};

export default function LayoutManagement({ children }: LayoutManagementProps) {
  const logoSrc = "/logo.png";
  return (
    <Container>
      <FormContainer>
        <Logo src={logoSrc} />
        <FormAuthContainer>{children}</FormAuthContainer>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="https://ikigai.li"
            target="_blank"
            rel="noopener noreferrer"
          >
            <a target="_blank">
              <Text
                weight="medium"
                color={"gray"}
                style={{ cursor: "pointer" }}
              >
                <Trans>Powered by ikigai</Trans>
              </Text>
            </a>
          </Link>
          <Separator orientation="vertical" />
          <Link
            href={Config.privacyPage}
            target="_blank"
            rel="noopener noreferrer"
          >
            <a target="_blank">
              <Text
                weight="medium"
                color={"gray"}
                style={{ cursor: "pointer" }}
              >
                <Trans>Privacy Policy</Trans>
              </Text>
            </a>
          </Link>
          <Separator orientation="vertical" />
          <Link
            href={Config.termPage}
            target="_blank"
            rel="noopener noreferrer"
          >
            <a target="_blank">
              <Text
                weight="medium"
                color={"gray"}
                style={{ cursor: "pointer" }}
              >
                <Trans>Terms of service</Trans>
              </Text>
            </a>
          </Link>
        </div>
      </FormContainer>
    </Container>
  );
}
