import { Trans, t } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import toast from "react-hot-toast";
import { useState } from "react";
import validator from "validator";
import { useKeyPress } from "ahooks";
import { Button, Text, TextField } from "@radix-ui/themes";

import { handleError } from "graphql/ApolloClient";
import { SEND_MAGIC_LINK } from "graphql/mutation/UserMutation";
import { SendMagicLink } from "graphql/types";

const MagicLink = () => {
  const [email, setEmail] = useState("");
  const [sendMagicLink, { loading }] = useMutation<SendMagicLink>(
    SEND_MAGIC_LINK,
    {
      onError: handleError,
    },
  );

  useKeyPress("enter", () => {
    send();
  });

  const send = async () => {
    if (!validator.isEmail(email)) {
      toast.error(t`Wrong email format!`);
      return;
    }
    const { data } = await sendMagicLink({
      variables: {
        email,
      },
    });
    if (data) {
      if (data.userGenerateMagicLink) {
        toast.success(t`Sent. Please check your email inbox!`);
      } else {
        toast.error(t`Failed! Please try again.`);
      }
    }
  };

  return (
    <Container>
      <Text weight="bold">
        <Trans>Email</Trans>
      </Text>
      <TextField.Root
        placeholder={t`Type your email!`}
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
      />
      <DescriptionDiv>
        <Text color="gray" size="1">
          We will send a link to your email. You can access your space by open
          the magic link inside email.
        </Text>
      </DescriptionDiv>
      <Button onClick={send} loading={loading} disabled={loading}>
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
