import React, { useState } from "react";

import { Space } from "antd";
import styled, { useTheme } from "styled-components";

import { Close } from "components/common/IconSvg";
import { Text, TextWeight } from "components/common/Text";

import { Title, ActionButton, Input, Container, Box } from "./styles";
import { Trans, t } from "@lingui/macro";
import { UserUpdateKeys } from "./BasicInformation";
import useAuthUserStore from "context/ZustandAuthStore";

const ContactItemContainer = styled(Space)`
  padding: 22px 0;
  flex: 1;
  justify-content: space-between;
  &:not(:last-child) {
    border-bottom: ${(props) => `1px solid ${props.theme.colors.gray[4]})`};
  }
`;

const ContactName = styled(Text)`
  font-size: 14px;
  font-weight: ${TextWeight.bold};
  display: flex;
  algin-items: center;
  gap: 18px;
  line-height: 32px;
`;

interface Props {
  children: React.ReactNode;
  title: string;
  keyName: UserUpdateKeys;
}

const ContactItem = ({ children, keyName }: Props) => {
  const theme = useTheme();
  const [updateValue, setUpdateValue] = useState("");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const { setUpdateUserData } = useAuthUserStore();

  const handleOnClickSubmit = () => {
    setUpdateUserData({ [keyName]: updateValue });
    setIsEdit(false);
  };

  return (
    <ContactItemContainer>
      {children}
      <>
        {isEdit ? (
          <Space size={20}>
            <Input
              onChange={(e) => setUpdateValue(e.target.value)}
              placeholder="Enter link"
            />
            <ActionButton onClick={handleOnClickSubmit}>
              <Trans>Submit</Trans>
              <Close color={theme.colors.gray[8]} />
            </ActionButton>
          </Space>
        ) : (
          <p />
        )}
      </>
    </ContactItemContainer>
  );
};

const Contact = () => {
  const theme = useTheme();
  const { currentUser } = useAuthUserStore();

  return (
    <Container>
      <Title>
        <Trans>Contact Media</Trans>
      </Title>
      <Box style={{ marginTop: "-22px" }}>
        <div style={{ display: "flex", width: "100%" }}>
          <ContactItem keyName={UserUpdateKeys.EMAIL} title={t`Change Email`}>
            <Space direction="vertical" size={0}>
              <ContactName>
                <Trans>Email</Trans>
              </ContactName>
              <Text color={theme.colors.gray[7]} level={2}>
                {currentUser?.userMe?.email}
              </Text>
            </Space>
          </ContactItem>
        </div>
      </Box>
    </Container>
  );
};

export default Contact;
