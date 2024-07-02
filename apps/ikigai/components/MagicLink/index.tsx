import { Trans, t } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import toast from "react-hot-toast";
import { useState } from "react";
import validator from "validator";
import { useKeyPress } from "ahooks";
import { GoogleLogin } from "@react-oauth/google";
import { Button, Separator, Text, TextField } from "@radix-ui/themes";

import { handleError } from "graphql/ApolloClient";
import {
  SEND_MAGIC_LINK,
  SIGNIN_WITH_GOOGLE,
} from "graphql/mutation/UserMutation";
import { SendMagicLink, SigninWithGoogle } from "graphql/types";
import TokenStorage from "storage/TokenStorage";
import UserStorage from "storage/UserStorage";

const MagicLink = () => {
  const [email, setEmail] = useState("");
  const [sendMagicLink, { loading }] = useMutation<SendMagicLink>(
    SEND_MAGIC_LINK,
    {
      onError: handleError,
    },
  );
  const [signInWithGoogle] = useMutation<SigninWithGoogle>(SIGNIN_WITH_GOOGLE, {
    onError: handleError,
    onCompleted: (data) => {
      TokenStorage.set(data.userSigninWithGoogle.accessToken);
      UserStorage.set(data.userSigninWithGoogle.user.id);
      window.location.reload();
    },
  });

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
        autoFocus
      />
      <DescriptionDiv>
        <Text color="gray" size="1">
          We will send a link to your email. You can access your space by open
          the magic link inside email.
        </Text>
      </DescriptionDiv>
      <Button
        onClick={send}
        loading={loading}
        disabled={loading || !validator.isEmail(email)}
        style={{ width: "100%" }}
      >
        <Trans>Send me a magic link!</Trans>
      </Button>
      <Separator style={{ width: "100%", marginTop: 10, marginBottom: 10 }} />
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            signInWithGoogle({
              variables: {
                idToken: credentialResponse.credential,
              },
            });
          } else {
            toast.error(
              t`Cannot get credentials from google. Please try again!`,
            );
          }
        }}
        onError={() => {
          toast.error(t`Cannot signin with google.`);
        }}
      />
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
