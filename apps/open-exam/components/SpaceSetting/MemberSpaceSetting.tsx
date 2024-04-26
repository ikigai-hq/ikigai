import {Table, TableProps, Typography} from "antd";

import useSpaceMemberStore from "context/ZustandSpaceMembeStore";
import useSpaceStore from "context/ZustandSpaceStore";
import {GetSpaceMembers_spaceGet_members as ISpaceMember} from "graphql/types";
import UserBasicInformation from "../UserBasicInformation";
import {t} from "@lingui/macro";
import {fromNow} from "../../util/Time";

const MemberSpaceSetting = () => {
  const spaceId = useSpaceStore(state => state.spaceId);
  const hMembers= useSpaceMemberStore(state => state.data.get(spaceId));
  const members = hMembers ? Array.from(hMembers.values()) : [];
  const columns: TableProps<ISpaceMember>['columns'] = [
    {
      title: t`Name`,
      dataIndex: "name",
      key: "name",
      render: (_value, member) =>
        <UserBasicInformation
          name={`${member.user.firstName} ${member.user.lastName}`}
          avatar={member.user.avatar?.publicUrl}
          randomColor={member.user.randomColor}
          email={member.user.email}
        />,
    },
    {
      title: t`Role`,
      dataIndex: "role",
      key: "role",
      render: (_, member) => <Typography.Text>{member.user.orgMember.orgRole}</Typography.Text>,
    },
    {
      title: t`Member since`,
      dataIndex: "since",
      key: "since",
      render: (_, member) => <Typography.Text>{fromNow(member.createdAt)}</Typography.Text>,
    },
  ];
  
  return (
    <div>
      <Table
        rowKey="userId"
        columns={columns}
        dataSource={members}
      />
    </div>
  );
};

export default MemberSpaceSetting;
