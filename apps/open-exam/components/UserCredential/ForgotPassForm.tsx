import React from "react";

import { LeftOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Space, Form, Col } from "antd";
import { useRouter } from "next/router";

import { Button } from "components/common/Button";
import { Text } from "components/common/Text";

import { FORGOT_PASSWORD } from "graphql/mutation";
import {
  FormAuthContainer,
  WelcomeTitle,
  PreviousStep,
  SubmitButton,
} from "./styles";
import { handleError } from "graphql/ApolloClient";
import { Trans, t } from "@lingui/macro";
import IdentityInput from "../IdentityInput";
import { useTheme } from "styled-components";

interface Props {
  setStep: (number) => void;
  identity: string;
  onChangeIdentity: (identity: string) => void;
}

const ForgotPassForm: React.FC<Props> = ({ setStep, onChangeIdentity, identity }) => {
  const theme = useTheme();
  const router = useRouter();
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
    onError: handleError,
    onCompleted: () => setStep(2),
  });

  const onSubmit = async () => {
    const variables = { identity };
    await forgotPassword({ variables });
  };

  return (
    <FormAuthContainer>
      <Space direction="vertical" size={0}>
        <PreviousStep onClick={() => router.back()}>
          <LeftOutlined />
        </PreviousStep>
        <WelcomeTitle>
          <Space size={8} direction="vertical">
            <Text level={7} weight={700} color={theme.colors.blue[9]}>
              <Trans>Reset Password</Trans>
            </Text>
            <Text level={3} weight={400} color={theme.colors.gray[8]}>
              <Trans>Enter your email or phone number to reset password</Trans>
            </Text>
          </Space>
        </WelcomeTitle>
        <Col>
          <Form
            name="forgot-password"
            initialValues={{ email: "" }}
            layout="vertical"
            onFinish={onSubmit}
          >
            <IdentityInput
              defaultIdentity=""
              onChangeIdentity={onChangeIdentity}
            />
            <SubmitButton>
              <Button
                loading={loading}
                width="100%"
                type="primary"
                htmlType="submit"
              >
                <Trans>Reset Password</Trans>
              </Button>
            </SubmitButton>
          </Form>
        </Col>
      </Space>
    </FormAuthContainer>
  );
};

export default ForgotPassForm;
