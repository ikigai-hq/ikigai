import { Popconfirm, Table, TableProps, Tooltip, Typography } from "antd";
import { useMutation } from "@apollo/client";
import { DeleteOutlined } from "@ant-design/icons";
import { t } from "@lingui/macro";
import toast from "react-hot-toast";

import useSpaceMemberStore from "context/ZustandSpaceMembeStore";
import useSpaceStore from "context/ZustandSpaceStore";
import { GetSpaceMembers_spaceGet_members as ISpaceMember } from "graphql/types";
import UserBasicInformation from "../UserBasicInformation";
import { fromNow } from "util/Time";
import { TextButtonWithHover } from "../common/Button";
import { REMOVE_SPACE_MEMBER } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";

const MemberSpaceSetting = () => {
  const spaceId = useSpaceStore((state) => state.spaceId);
  const space = useSpaceStore((space) => space.space);
  const removeSpaceMemberInStore = useSpaceMemberStore(
    (space) => space.removeSpaceMember,
  );
  const hMembers = useSpaceMemberStore((state) => state.data.get(spaceId));
  const [removeMember] = useMutation(REMOVE_SPACE_MEMBER, {
    onError: handleError,
  });
  const onRemoveMember = async (member: ISpaceMember) => {
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

  const members = hMembers ? Array.from(hMembers.values()) : [];
  const columns: TableProps<ISpaceMember>["columns"] = [
    {
      title: t`Name`,
      dataIndex: "name",
      key: "name",
      render: (_value, member) => (
        <UserBasicInformation
          name={`${member.user.firstName} ${member.user.lastName}`}
          avatar={member.user.avatar?.publicUrl}
          randomColor={member.user.randomColor}
          email={member.user.email}
        />
      ),
    },
    {
      title: t`Role`,
      dataIndex: "role",
      key: "role",
      render: (_, member) => {
        if (member.userId === space?.creatorId) {
          return <Typography.Text>OWNER</Typography.Text>;
        }
        return <Typography.Text>{member.role}</Typography.Text>;
      },
    },
    {
      title: t`Member since`,
      dataIndex: "since",
      key: "since",
      render: (_, member) => (
        <Typography.Text>{fromNow(member.createdAt)}</Typography.Text>
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      render: (_, member) => {
        const isOwner = member.userId === space?.creatorId;
        if (isOwner) return <></>;

        return (
          <div>
            <Popconfirm
              title={t`Do you want to remove this member?`}
              onConfirm={() => onRemoveMember(member)}
            >
              <Tooltip arrow={false} title={t`Remove member`}>
                <TextButtonWithHover
                  type="text"
                  icon={<DeleteOutlined style={{ color: "red" }} />}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table rowKey="userId" columns={columns} dataSource={members} />
    </div>
  );
};

export default MemberSpaceSetting;
