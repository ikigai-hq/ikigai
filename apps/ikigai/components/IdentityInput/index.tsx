import React, { useState } from "react";
import { Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import { useTheme } from "styled-components";

import { Input } from "../common/Input";
import { Text } from "../common/Text";
import validator from "validator";

export enum IdentityOpts {
  Email,
}

export type IdentityInputProps = {
  defaultOptions?: IdentityOpts;
  defaultIdentity?: string;
  onChangeIdentity?: (identity: string) => void;
  onChangeError?: (error: string | undefined) => void;
};

const IdentityInput = ({
  defaultIdentity,
  defaultOptions,
  onChangeIdentity,
  onChangeError,
}: IdentityInputProps) => {
  const theme = useTheme();
  const [identity, setIdentity] = useState(defaultIdentity || "");
  const [option, setOption] = useState(defaultOptions || IdentityOpts.Email);

  const formatIdentity = (identity: string) => {
    return identity;
  };

  const checkError = (
    identity: string,
    option: IdentityOpts,
  ): string | undefined => {
    if (identity === "") return;

    if (option === IdentityOpts.Email && !validator.isEmail(identity)) {
      return t`Invalid email`;
    }
  };

  const handleChangeIdentity = (newIdentity: string) => {
    setIdentity(newIdentity);
    if (onChangeError) onChangeError(checkError(newIdentity, option));
    if (onChangeIdentity) {
      const realIdentity = formatIdentity(newIdentity);
      onChangeIdentity(realIdentity);
    }
  };

  const error = checkError(identity, option);
  return (
    <div style={{ marginBottom: "5px" }}>
      {option === IdentityOpts.Email && (
        <>
          <div style={{ marginBottom: "8px" }}>
            <Text level={2} weight={500} color={theme.colors.blue[9]}>
              <Trans>Email</Trans>
            </Text>
          </div>
          <Input
            size="large"
            value={identity}
            onChange={(e) => handleChangeIdentity(e.currentTarget.value)}
            placeholder={t`Type your email`}
          />
        </>
      )}
      {error && (
        <div>
          <Typography.Text type="danger">{error}</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default IdentityInput;
