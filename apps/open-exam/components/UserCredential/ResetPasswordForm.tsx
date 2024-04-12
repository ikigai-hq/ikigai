import React, { useState } from "react";

import { LeftOutlined } from "@ant-design/icons";
import { Space, Col } from "antd";
import { Text } from "components/common/Text";
import { FormAuthContainer, WelcomeTitle, PreviousStep } from "./styles";
import { t, Trans } from "@lingui/macro";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { useMutation } from "@apollo/client";
import { RESET_PASSWORD } from "graphql/mutation";
import { useRouter } from "next/router";
import { handleError } from "graphql/ApolloClient";
import toast from "react-hot-toast";
import { useTheme } from "styled-components";

interface Props {
  identity: String,
  setStep: (number) => void;
}

const ResetPasswordForm: React.FC<Props> = ({ setStep, identity }) => {
  const theme = useTheme();
  const router = useRouter();
  const [otp, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onError: handleError,
    onCompleted: () => {
      const toastMessage = t`Reset password successfully!`;
      toast.success(toastMessage);
      router.push("/signin");
    },
  });

  const onClickReset = () => {
    resetPassword({
      variables: {
        identity,
        otp,
        newPassword,
      },
    });
  };

  return (
    <FormAuthContainer>
      <Space direction="vertical" size={0}>
        <PreviousStep onClick={() => setStep(1)}>
          <LeftOutlined />
        </PreviousStep>
        <WelcomeTitle style={{ marginBottom: "15px" }}>
          <Space size={8} direction="vertical">
            <Text level={7} weight={700} color={theme.colors.blue[9]}>
              <Trans>Check Your Email</Trans>
            </Text>
            <Text level={3} weight={400} color={theme.colors.gray[8]}>
              <Trans>
                We have emailed you OTP Code to <b>{identity}</b> to reset password.
              </Trans>
            </Text>
          </Space>
        </WelcomeTitle>
        <div style={{ marginBottom: "10px" }}>
          <Text level={2} weight={500} color={theme.colors.blue[9]} strong>
            <Trans>OTP Code:</Trans>
          </Text>
          <Input
            placeholder={"Type your OTP here"}
            value={otp}
            onChange={e => setOTP(e.currentTarget.value)}
          />
          <Text level={2} weight={500} color={theme.colors.blue[9]} strong>
            <Trans>New password:</Trans>
          </Text>
          <Input
            type="password"
            color={theme.colors.blue[9]}
            placeholder={t`Enter your new password`}
            value={newPassword}
            onChange={e => setNewPassword(e.currentTarget.value)}
          />
          <Text type="secondary" level={3}>
            <Trans>Password length must be greater than 8 chars.</Trans>
          </Text>
        </div>
        <div style={{ float: "right" }}>
          <Button
            type="primary"
            disabled={newPassword.length < 8 || otp.length !== 6 || loading}
            loading={loading}
            onClick={onClickReset}
          >
            <Trans>
              Reset your password
            </Trans>
          </Button>
        </div>
        <Col>
          <Text level={3} weight={400} color={theme.colors.gray[8]}>
            <Trans>Did not receive the email?</Trans>
          </Text>
          <br />
          <Text level={3} weight={400} color={theme.colors.gray[8]}>
            <Trans>Check your spam filter, or</Trans>{" "}
            <Text
              style={{ cursor: "pointer" }}
              onClick={() => setStep(1)}
              level={3}
              weight={500}
              color={theme.colors.blue[5]}
            >
              <Trans>try another email again!</Trans>
            </Text>
          </Text>
        </Col>
      </Space>
    </FormAuthContainer>
  );
};

export default ResetPasswordForm;
