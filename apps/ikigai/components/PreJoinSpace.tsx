import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Divider, Input, Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import useAuthUserStore from "../store/AuthStore";
import { useMutation } from "@apollo/client";
import { JOIN_SPACE_BY_INVITE_TOKEN } from "../graphql/mutation/SpaceMutation";
import { handleError } from "../graphql/ApolloClient";
import validator from "validator";
import toast from "react-hot-toast";
import { JoinSpaceByInviteToken } from "../graphql/types";

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
      toast.success(t`Joined! Please check your mail inbox`);
    } else {
      setStatus(false);
    }
  };

  return (
    <div style={{ width: "400px" }}>
      {status === undefined && (
        <div>
          <Typography.Title level={5}>
            <Trans>You've been invited to join ikigai</Trans>
          </Typography.Title>
          <Typography.Text strong>
            <Trans>Email</Trans>
          </Typography.Text>
          <Input
            placeholder={t`Type your email!`}
            value={email}
            readOnly={!!currentEmail}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <Divider />
          <Button
            type="primary"
            style={{ width: "100%" }}
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
          <Typography.Title level={5}>
            <Trans>Joined!</Trans>
          </Typography.Title>
          <Typography.Text type="secondary">
            <Trans>
              You've joined. We've sent a magic email to{" "}
              <b style={{ color: "black" }}>{email}</b>. Open the link in email
              to access space.
            </Trans>
          </Typography.Text>
        </div>
      )}
    </div>
  );
};

export default PreJoinSpace;
