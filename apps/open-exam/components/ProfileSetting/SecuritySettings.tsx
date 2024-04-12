import React, { useState } from "react";

import { useMutation } from "@apollo/client";
import { Form, message, Space } from "antd";
import styled, { useTheme } from "styled-components";

import { Button } from "components/common/Button";
import { Input as InputStyle } from "components/common/Input";
import { Text, TextWeight } from "components/common/Text";

import { handleError } from "../../graphql/ApolloClient";
import { UPDATE_PASSWORD } from "../../graphql/mutation";
import { t, Trans } from "@lingui/macro";

const SecuritySettingContainer = styled.div`
  background: ${(props) => props.theme.colors.gray[0]};
  border: 1px solid ${(props) => props.theme.colors.gray[4]};
  border-radius: 12px;
  width: 100%;
  height: 100%;
  padding: 28px;
  text-align: left;
`;

const TitlePage = styled(Text)`
  margin-bottom: 24px;
  display: block;
`;

export const FormSetting = styled(Form)<{ width?: number }>`
  max-width: ${(props) => (props.width ? `${props.width}px` : "100%")};

  .ant-form-item {
    margin-bottom: 20px;
    &:last-child {
      margin-top: 28px;
      margin-bottom: 0;
    }
  }
`;

export const FormTitle = styled(Text)`
  color: ${(props) => props.theme.colors.gray[8]};
  font-size: 14px;
  line-height: 22px;
`;

export const Input = styled(InputStyle)`
  padding: 5px 12px;
  font-size: 14px;
`;

const SecuritySettings = () => {
  const theme = useTheme();
  const [form] = Form.useForm();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setRetypePassword("");
    form.resetFields();
  };

  const [updatePassword, { loading }] = useMutation(UPDATE_PASSWORD, {
    onError: handleError,
    onCompleted: () => {
      message.success(t`Update password successfully`);
      reset();
    },
  });

  const onSave = async () => {
    if (newPassword !== retypePassword) return;
    if (newPassword.length < 8) return;

    const variables = {
      currentPassword,
      newPassword,
    };

    await updatePassword({ variables });
  };

  return (
    <SecuritySettingContainer>
      <TitlePage
        level={4}
        weight={TextWeight.bold}
        color={theme.colors.gray[8]}
      >
        <Trans>Security Settings</Trans>
      </TitlePage>
      <FormSetting
        layout="vertical"
        initialValues={{
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }}
        autoComplete="off"
        onFinish={onSave}
        form={form}
        width={497}
      >
        <Form.Item
          name="currentPassword"
          label={
            <FormTitle>
              <Trans>Current Password</Trans>
            </FormTitle>
          }
        >
          <Input
            type="password"
            placeholder={t`Enter your current password`}
            onChange={(e) => setCurrentPassword(e.currentTarget.value)}
          />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label={
            <FormTitle>
              <Trans>New Password</Trans>
            </FormTitle>
          }
          validateStatus={
            newPassword !== "" && newPassword.length < 8 ? "error" : "success"
          }
          help={t`Password length must be greater than 8`}
        >
          <Input
            type="password"
            placeholder={t`Enter your new password`}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={
            <FormTitle>
              <Trans>Confirm New Password</Trans>
            </FormTitle>
          }
          validateStatus={
            retypePassword !== "" && retypePassword !== newPassword
              ? "error"
              : "success"
          }
          help={t`Confirm password should be same with new password`}
        >
          <Input
            type="password"
            placeholder={t`Enter your new password`}
            onChange={(e) => setRetypePassword(e.currentTarget.value)}
          />
        </Form.Item>
        <Form.Item>
          <Space
            size={12}
            style={{ justifyContent: "flex-end", width: "100%" }}
          >
            <Button onClick={reset}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
            >
              <Trans>Save</Trans>
            </Button>
          </Space>
        </Form.Item>
      </FormSetting>
    </SecuritySettingContainer>
  );
};

export default SecuritySettings;
