import {Button, Popconfirm, Table, TableProps, Tooltip, Typography} from "antd";
import {t, Trans} from "@lingui/macro";
import {useState} from "react";
import {useMutation, useQuery} from "@apollo/client";
import {toast} from "react-hot-toast";
import copy from "copy-to-clipboard";
import {CopyOutlined, DeleteOutlined} from "@ant-design/icons";

import CreateSpaceInvite from "./CreateSpaceInvite";
import {GET_SPACE_INVITE_TOKENS} from "graphql/query/SpaceQuery";
import {handleError} from "graphql/ApolloClient";
import useSpaceStore from "context/ZustandSpaceStore";
import {
  GetSpaceInviteTokens,
  GetSpaceInviteTokens_spaceGetInviteTokens as ISpaceInviteToken,
} from "graphql/types";
import {fromNow, getNowAsSec} from "util/Time";
import {formatPreJoinSpaceUrl} from "config/Routes";
import {TextButtonWithHover} from "components/common/Button";
import {DELETE_SPACE_INVITE_TOKEN} from "graphql/mutation/SpaceMutation";
import UserBasicInformation from "../UserBasicInformation";

const InviteSpaceSetting = () => {
  const spaceId = useSpaceStore(state => state.spaceId);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const { data, refetch } = useQuery<GetSpaceInviteTokens>(GET_SPACE_INVITE_TOKENS, {
    skip: !spaceId,
    onError: handleError,
    variables: {
      spaceId,
    },
    fetchPolicy: "network-only",
  });
  const [deleteInviteToken] = useMutation(DELETE_SPACE_INVITE_TOKEN, {
    onError: handleError,
  });
  
  const onDeleteInviteToken = async (inviteToken: ISpaceInviteToken) => {
    const { data } = await deleteInviteToken({
      variables: {
        spaceId: inviteToken.spaceId,
        inviteToken: inviteToken.token,
      }
    });
    
    if (data) {
      refetch();
      toast.success(t`Deleted!`);
    }
  }
  
  const columns: TableProps<ISpaceInviteToken>['columns'] = [
    {
      title: t`Inviter`,
      dataIndex: "inviter",
      key: "inviter",
      render: (_value, invite) =>
        <UserBasicInformation
          name={`${invite.creator.firstName} ${invite.creator.lastName}`}
          avatar={invite.creator.avatar?.publicUrl}
          randomColor={invite.creator.randomColor}
          email={invite.creator.email}
        />,
    },
    {
      title: t`Invite token`,
      dataIndex: "token",
      key: "token",
      render: (token) => <Typography.Text strong>{token}</Typography.Text>,
    },
    {
      title: t`Inviting role`,
      dataIndex: "invitingRole",
      key: "invitingRole",
      render: (role) => <Typography.Text>{role}</Typography.Text>,
    },
    {
      title: t`Expire`,
      dataIndex: "expireAt",
      key: "expireAt",
      render: (expireAt) => {
        if (expireAt) {
          const now = getNowAsSec();
          if (now > expireAt) {
            return <Typography.Text><Trans>Expired</Trans></Typography.Text>;
          }
          
          return <Typography.Text>{fromNow(expireAt)}</Typography.Text>;
        }
        
        return <Typography.Text><Trans>Never</Trans></Typography.Text>;
      }
    },
    {
      title: t`Uses`,
      dataIndex: "uses",
      key: "uses",
      render: (uses) => <Typography.Text>{uses}</Typography.Text>
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (_, inviteToken) => {
        const link = formatPreJoinSpaceUrl(inviteToken.spaceId, inviteToken.token);
        
        return (
          <div style={{ display: "flex" }}>
            <Tooltip
              title={t`Copy invite link`}
              arrow={false}
            >
              <TextButtonWithHover
                type="text"
                icon={<CopyOutlined />}
                onClick={() => {
                  copy(link);
                  toast.success(t`Copied!`);
                }}
              />
            </Tooltip>
            <Popconfirm
              trigger={"click"}
              title={t`Do you want to delete this invite link`}
              onConfirm={() => onDeleteInviteToken(inviteToken)}
            >
              <TextButtonWithHover
                type="text"
                icon={<DeleteOutlined style={{ color: "red" }} />}
              />
            </Popconfirm>
          </div>
        );
      }
    }
  ];
  
  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <Button
          type="primary"
          onClick={() => setShowCreateInvite(true)}
        >
          <Trans>Generate Invite Link</Trans>
        </Button>
      </div>
      <Table
        rowKey="userId"
        columns={columns}
        dataSource={data?.spaceGetInviteTokens || []}
      />
      {
        showCreateInvite &&
          <CreateSpaceInvite
              visible={showCreateInvite}
              onClose={() => {
                refetch();
                setShowCreateInvite(false)
              }}
          />
      }
    </div>
  );
};

export default InviteSpaceSetting;
