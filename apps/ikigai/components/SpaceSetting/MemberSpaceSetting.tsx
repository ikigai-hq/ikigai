import { useMutation } from "@apollo/client";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";

import useSpaceMemberStore from "store/SpaceMembeStore";
import useSpaceStore from "store/SpaceStore";
import { GetSpaceMembers_spaceGet_members as ISpaceMember } from "graphql/types";
import UserBasicInformation from "../UserBasicInformation";
import { fromNow } from "util/Time";
import { REMOVE_SPACE_MEMBER } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import { IconButton, Table } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import IkigaiAlertDialog from "../base/AlertDialog";

const MemberSpaceSetting = () => {
  const spaceId = useSpaceStore((state) => state.spaceId);
  const hMembers = useSpaceMemberStore((state) => state.data.get(spaceId));
  const members = hMembers ? Array.from(hMembers.values()) : [];

  return (
    <div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              <Trans>Name</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Role</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Member since</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {members.map((member) => (
            <Table.Row key={member.userId} align="center">
              <Table.RowHeaderCell>
                <UserBasicInformation
                  name={`${member.user.firstName} ${member.user.lastName}`}
                  avatar={member.user.avatar?.publicUrl}
                  randomColor={member.user.randomColor}
                  email={member.user.email}
                />
              </Table.RowHeaderCell>
              <Table.Cell>{member.role}</Table.Cell>
              <Table.Cell>{fromNow(member.createdAt)}</Table.Cell>
              <Table.Cell>
                <MemberActions member={member} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

const MemberActions = ({ member }: { member: ISpaceMember }) => {
  const ownerId = useSpaceStore((state) => state.space.creatorId);
  const removeSpaceMemberInStore = useSpaceMemberStore(
    (space) => space.removeSpaceMember,
  );
  const [removeMember] = useMutation(REMOVE_SPACE_MEMBER, {
    onError: handleError,
  });
  const onRemoveMember = async () => {
    const { data } = await removeMember({
      variables: {
        userId: member.userId,
        spaceId: member.spaceId,
      },
    });

    if (data) {
      removeSpaceMemberInStore(member);
      toast.success(t`Removed!`);
    }
  };

  const isOwner = member.userId === ownerId;
  if (isOwner) return <></>;

  return (
    <div>
      <IkigaiAlertDialog
        title={t`Remove ${member.user.name}`}
        description={t`Are you sure to remove ${member.user.name}?`}
        confirmText={t`Remove member`}
        onConfirm={onRemoveMember}
      >
        <IconButton color="red" size="1">
          <TrashIcon />
        </IconButton>
      </IkigaiAlertDialog>
    </div>
  );
};

export default MemberSpaceSetting;
