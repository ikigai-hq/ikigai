import { useRouter } from "next/router";
import { useState } from "react";
import { t, Trans } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import validator from "validator";
import toast from "react-hot-toast";
import { Button, TextField, Text, Heading } from "@radix-ui/themes";

import { JoinSpaceByInviteToken } from "graphql/types";
import { JOIN_SPACE_BY_INVITE_TOKEN } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import useAuthUserStore from "store/AuthStore";
import { formatDocumentRoute } from "../config/Routes";

const PreJoinSpace = () => {
  const router = useRouter();
  const currentEmail = useAuthUserStore(
    (state) => state.currentUser?.userMe?.email,
  );
  const [email, setEmail] = useState(currentEmail || "");
  const [joinSpace, { loading }] = useMutation<JoinSpaceByInviteToken>(
    JOIN_SPACE_BY_INVITE_TOKEN,
    {
      onError: handleError,
    },
  );
  const [status, setStatus] = useState<boolean | undefined>();

  const join = async () => {
    if (!validator.isEmail(email)) {
      toast.error(t`Wrong email format!`);
      return;
    }

    const { data } = await joinSpace({
      variables: {
        email,
        spaceId: parseInt(router.query.spaceId as string, 10),
        token: router.query.token,
      },
    });

    if (data) {
      setStatus(true);
      if (data.spaceJoinByInviteToken.shouldGoToSpace) {
        toast.success(t`Joined! We're moving you to the space!`);
        router.push(
          formatDocumentRoute(data.spaceJoinByInviteToken.documentId),
        );
      } else {
        toast.success(t`Joined! Please check your mail inbox`);
      }
    } else {
      setStatus(false);
    }
  };

  return (
    <div style={{ width: "400px" }}>
      {status === undefined && (
        <div>
          <Heading size="6" style={{ marginBottom: 10 }}>
            <Trans>You've been invited to join ikigai</Trans>
          </Heading>
          <Text weight="bold">
            <Trans>Email</Trans>
          </Text>
          <TextField.Root
            placeholder={t`Type your email!`}
            value={email}
            readOnly={!!currentEmail}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <Button
            style={{ width: "100%", marginTop: 10 }}
            loading={loading}
            disabled={loading}
            onClick={join}
          >
            <Trans>Join</Trans>
          </Button>
        </div>
      )}
      {status !== undefined && (
        <div>
          <Heading size="5">
            <Trans>Joined!</Trans>
          </Heading>
          <Text color="gray" style={{ marginTop: 10 }}>
            <Trans>
              You've joined. We've sent a magic email to{" "}
              <b style={{ color: "black" }}>{email}</b>. Open the link in email
              to access space.
            </Trans>
          </Text>
        </div>
      )}
    </div>
  );
};

export default PreJoinSpace;
