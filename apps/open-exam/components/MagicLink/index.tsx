import { Trans, t } from "@lingui/macro";
import {Button, Input, Typography} from "antd";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import toast from "react-hot-toast";
import {useState} from "react";

import {handleError} from "graphql/ApolloClient";
import {SEND_MAGIC_LINK} from "graphql/mutation/UserMutation";
import {SendMagicLink} from "graphql/types";
import validator from "validator";

const MagicLink = () => {
  const [email, setEmail] = useState("");
  const [sendMagicLink, { loading }] = useMutation<SendMagicLink>(SEND_MAGIC_LINK, {
    onError: handleError,
  });
  
  const send = async () => {
    if (!validator.isEmail(email)) {
      toast.error(t`Wrong email format!`);
      return;
    }
    const { data } = await sendMagicLink({
      variables: {
        email
      },
    });
    if (data) {
      if (data.userGenerateMagicLink) {
        toast.success(t`Sent. Please check your email inbox!`);
      } else {
        toast.error(t`Send email failed! Please try again.`);
      }
    }
  };
  
  return (
    <Container>
      <Typography.Text strong>
        <Trans>
          Email
        </Trans>
      </Typography.Text>
      <Input
        placeholder={t`Type your email!`}
        value={email}
        onChange={e => setEmail(e.currentTarget.value)}
      />
      <DescriptionDiv>
        <Typography.Text type="secondary">
          We will send a magic link to your email.
          You can access your space by open the magic link.
        </Typography.Text>
      </DescriptionDiv>
      <DescriptionDiv>
        <Typography.Text type="secondary">
        </Typography.Text>
      </DescriptionDiv>
      <Button
        type="primary"
        onClick={send}
        loading={loading}
        disabled={loading}
      >
        <Trans>Send me a magic link!</Trans>
      </Button>
    </Container>
  );
};

export default MagicLink;

const Container = styled.div`
  width: 300px;
`;

const DescriptionDiv = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;
