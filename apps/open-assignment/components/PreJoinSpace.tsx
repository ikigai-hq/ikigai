import {useRouter} from "next/router";
import {useState} from "react";
import {Button, Divider, Input, Typography} from "antd";
import {t, Trans} from "@lingui/macro";
import useAuthUserStore from "../context/ZustandAuthStore";
import {useMutation} from "@apollo/client";
import {JOIN_SPACE_BY_INVITE_TOKEN} from "../graphql/mutation/SpaceMutation";
import {handleError} from "../graphql/ApolloClient";
import validator from "validator";
import toast from "react-hot-toast";
import {JoinSpaceByInviteToken} from "../graphql/types";
import TokenStorage from "../storage/TokenStorage";
import {formatDocumentRoute} from "../config/Routes";

const PreJoinSpace = () => {
  const router = useRouter();
  const currentEmail = useAuthUserStore(state => state.currentUser?.userMe?.email);
  const [email, setEmail] = useState(currentEmail || "");
  const [joinSpace, { loading }] = useMutation<JoinSpaceByInviteToken>(JOIN_SPACE_BY_INVITE_TOKEN, {
    onError: handleError,
  });
  
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
      TokenStorage.set(data.spaceJoinByInviteToken.accessToken);
      window.location.replace(formatDocumentRoute(data.spaceJoinByInviteToken.starterDocument.id));
      toast.success(t`Joined! We're moving you to your space...`);
    }
  };
  
  return (
    <div style={{ width: "400px" }}>
      <Typography.Title level={5}>
        <Trans>You've been invited to join Open Assignment</Trans>
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
  );
};

export default PreJoinSpace;
