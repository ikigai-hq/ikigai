import { t, Trans } from "@lingui/macro";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-hot-toast";
import copy from "copy-to-clipboard";
import { Link1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { Button, IconButton, Table, Text, Tooltip } from "@radix-ui/themes";

import CreateSpaceInvite from "./CreateSpaceInvite";
import { GET_SPACE_INVITE_TOKENS } from "graphql/query/SpaceQuery";
import { handleError } from "graphql/ApolloClient";
import useSpaceStore from "../../store/SpaceStore";
import {
  GetSpaceInviteTokens,
  GetSpaceInviteTokens_spaceGetInviteTokens as ISpaceInviteToken,
} from "graphql/types";
import { fromNow, getNowAsSec } from "util/Time";
import { formatPreJoinSpaceUrl } from "config/Routes";
import { DELETE_SPACE_INVITE_TOKEN } from "graphql/mutation/SpaceMutation";
import UserBasicInformation from "../UserBasicInformation";
import IkigaiAlertDialog from "../base/AlertDialog";

const InviteSpaceSetting = () => {
  const spaceId = useSpaceStore((state) => state.spaceId);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const { data, refetch } = useQuery<GetSpaceInviteTokens>(
    GET_SPACE_INVITE_TOKENS,
    {
      skip: !spaceId,
      onError: handleError,
      variables: {
        spaceId,
      },
      fetchPolicy: "network-only",
    },
  );
  const [deleteInviteToken] = useMutation(DELETE_SPACE_INVITE_TOKEN, {
    onError: handleError,
  });

  const onDeleteInviteToken = async (inviteToken: ISpaceInviteToken) => {
    const { data } = await deleteInviteToken({
      variables: {
        spaceId: inviteToken.spaceId,
        inviteToken: inviteToken.token,
      },
    });

    if (data) {
      refetch();
      toast.success(t`Deleted!`);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <CreateSpaceInvite
          open={showCreateInvite}
          onOpenChange={(open) => {
            refetch();
            setShowCreateInvite(open);
          }}
        >
          <Button onClick={() => setShowCreateInvite(true)}>
            <PlusIcon /> <Trans>Generate Invite Link</Trans>
          </Button>
        </CreateSpaceInvite>
      </div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              <Trans>Inviter</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Inviting role</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Token</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Expire at</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data?.spaceGetInviteTokens?.map((invite) => (
            <Table.Row key={invite.token} align="center">
              <Table.RowHeaderCell>
                <UserBasicInformation
                  name={`${invite.creator.firstName} ${invite.creator.lastName}`}
                  avatar={invite.creator.avatar?.publicUrl}
                  randomColor={invite.creator.randomColor}
                  email={invite.creator.email}
                />
              </Table.RowHeaderCell>
              <Table.Cell>{invite.invitingRole}</Table.Cell>
              <Table.Cell>{invite.token}</Table.Cell>
              <Table.Cell>
                <ExpireInformation expireAt={invite.expireAt} />
              </Table.Cell>
              <Table.Cell>
                <InviteTokenActions
                  inviteToken={invite}
                  onDeleteInviteToken={() => onDeleteInviteToken(invite)}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

const ExpireInformation = ({ expireAt }: { expireAt: number }) => {
  if (expireAt) {
    const now = getNowAsSec();
    if (now > expireAt) {
      return (
        <Text>
          <Trans>Expired</Trans>
        </Text>
      );
    }

    return <Text>{fromNow(expireAt)}</Text>;
  }

  return (
    <Text>
      <Trans>Never</Trans>
    </Text>
  );
};

const InviteTokenActions = ({
  inviteToken,
  onDeleteInviteToken,
}: {
  inviteToken: ISpaceInviteToken;
  onDeleteInviteToken: () => void;
}) => {
  const link = formatPreJoinSpaceUrl(inviteToken.spaceId, inviteToken.token);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <Tooltip content={t`Copy invite link`}>
        <IconButton
          variant="soft"
          size="1"
          onClick={() => {
            copy(link);
            toast.success(t`Copied!`);
          }}
        >
          <Link1Icon />
        </IconButton>
      </Tooltip>
      <IkigaiAlertDialog
        title={t`Remove invite token`}
        description={t`Are you sure to remove this invite token?`}
        onConfirm={onDeleteInviteToken}
      >
        <IconButton color="red" size="1">
          <TrashIcon />
        </IconButton>
      </IkigaiAlertDialog>
    </div>
  );
};

export default InviteSpaceSetting;
