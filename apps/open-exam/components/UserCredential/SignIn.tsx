import React, { ChangeEvent, useState } from "react";

import { useMutation } from "@apollo/client";
import { Col, Form, Row, Space } from "antd";
import Link from "next/link";
import { useCookies } from "react-cookie";
import styled, { useTheme } from "styled-components";
import toast from "react-hot-toast";

import { Button } from "components/common/Button";
import { Text } from "components/common/Text";
import { Routes } from "config/Routes";
import { handleError } from "graphql/ApolloClient";
import { LOGIN } from "graphql/mutation";
import { Login } from "graphql/types";
import TokenStorage from "storage/TokenStorage";

import { Input as InputCommon } from "../common/Input";
import { FormAuthContainer, WelcomeTitle } from "./styles";
import CurrentPathStorage from "storage/CurrentPathStorage";
import { useRouter } from "next/router";
import { t, Trans } from "@lingui/macro";
import IdentityInput, { IdentityOpts } from "../IdentityInput";
import { getRedirectUrl } from "../../util/UrlUtil";

const ForgotPassword = styled(Text)`
  text-decoration: underline;
  cursor: pointer;
`;

const RememberMe = styled(Row)`
  margin: 0 0 28px 0;
`;

const SignIn = () => {
  const theme = useTheme();
  const router = useRouter();
  const [_, setCookie] = useCookies(["token"]);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [identityError, setIdentityError] = useState(false);
  
  const [login, { loading }] = useMutation<Login>(
    LOGIN,
    {
      onError: handleError,
      onCompleted: (value) => {
        const token = value.userLogin;
        TokenStorage.set(token);
        setCookie("token", token, {
          path: "/",
          maxAge: 3600,
          sameSite: true,
        });
        toast.success(t`Login successfully!`);
        const redirectUrl = getRedirectUrl(router);
        // @ts-ignore
        window.location.replace(redirectUrl|| Routes.Home);
        CurrentPathStorage.del();
      },
    }
  );
  
  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
  };
  
  const onSubmit = async () => {
    const variables = { identity: identity.toLowerCase(), password };
    await login({ variables });
  };
  
  return (
    <FormAuthContainer>
      <Space direction="vertical" size={0}>
        <WelcomeTitle>
          <Text level={5} weight={700} color={theme.colors.gray[8]}>
            <Trans>Login to your account</Trans>
          </Text>
        </WelcomeTitle>
        <Col>
          <Form
            name="signin"
            initialValues={{ identity: "", password: "" }}
            layout="vertical"
            onFinish={onSubmit}
          >
            <IdentityInput
              defaultIdentity=""
              defaultOptions={IdentityOpts.Email}
              onChangeIdentity={setIdentity}
              onChangeError={(errorMessage) => setIdentityError(!!errorMessage)}
            />
            
            <Form.Item
              label={
                <Text level={2} weight={500} color={theme.colors.blue[9]}>
                  <Trans>Password</Trans>
                </Text>
              }
              name="password"
              required={false}
              style={{ marginBottom: 13 }}
            >
              <InputCommon
                color={theme.colors.blue[9]}
                value={password}
                onChange={onChangePassword}
                type="password"
                placeholder={t`Enter your password`}
              />
            </Form.Item>
            <RememberMe justify="space-between">
              <Col />
              <Col>
                <Link href="/forgot-password" passHref>
                  <ForgotPassword
                    level={2}
                    weight={400}
                    color={theme.colors.gray[8]}
                  >
                    <Trans>Forgot password</Trans>
                  </ForgotPassword>
                </Link>
              </Col>
            </RememberMe>
            <Form.Item>
              <Button
                disabled={loading || identityError || identity.length === 0}
                loading={loading}
                width="100%"
                type="primary"
                htmlType="submit"
              >
                <Trans>Login</Trans>
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Space>
    </FormAuthContainer>
  );
};

export default SignIn;
