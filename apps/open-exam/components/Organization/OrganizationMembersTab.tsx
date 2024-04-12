import React from "react";

import { Card, Col, Divider, Dropdown, Input, Modal, Row, Select, Statistic, Tag } from "antd";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useMutation, useQuery } from "@apollo/client";

import {
  GetOrganizationMembers_orgFindMembers_items as IMember, GetOrgStats,
  OrgRole
} from "graphql/types";
import { formatDate, FormatType } from "util/Time";
import AvatarWithName from "../AvatarWithName";
import Table from "../common/Table";
import { Text } from "components/common/Text";
import styled from "styled-components";
import { MoreOutlined } from "@ant-design/icons";
import Loading from "../Loading";
import { GET_ORG_STATS } from "graphql/query";
import { handleError } from "graphql/ApolloClient";
import { REMOVE_ORG_MEMBER } from "graphql/mutation";
import { getRoleColor, getRoleName } from "../../util";
import { formatDocumentRoute } from "config/Routes";
import useAuthUserStore from "context/ZustandAuthStore";
import useOrganizationStore, { MEMBER_PER_PAGE, useLoadOrganizationMembers } from "context/ZustandOrganizationStore";
import { t, Trans } from "@lingui/macro";
import { DateRangePicker } from "components/common/DatePickerWrapper";
import { Moment } from "moment";

const roles = [
  {
    role: OrgRole.TEACHER,
    content: t`Teacher`,
  },
  {
    role: OrgRole.STUDENT,
    content: t`Student`,
  },
];

const StyledMoreOutlined = styled(MoreOutlined)`
  font-size: 16px;
  color: ${(props) => props.theme.colors.gray[8]};
  height: min-content;
`;

const OrganizationMembersTab = () => {
  const router = useRouter();
  const authUser = useAuthUserStore((state) => state.currentUser);
  const setActiveMember = useOrganizationStore(state => state.setActiveMember);
  const {
    total,
    members,
    loading,
    fetch,
    page, setPage,
    role, setRole,
    setKeyword,
    createdDateRange, setCreatedDateRange,
  } = useLoadOrganizationMembers();
  
  const [removeOrgMemberModal, removeOrgMemberContextHolder] = Modal.useModal();
  const { data: orgStats } = useQuery<GetOrgStats>(GET_ORG_STATS, {
    onError: handleError,
  });

  const [removeOrgMember] = useMutation(REMOVE_ORG_MEMBER, {
    onError: handleError,
    onCompleted: () => fetch(),
  });


  const onchangeKeyword = (newKeyword: string) => {
    setPage(1);
    setKeyword(newKeyword);
  };

  const onChangeRole = (role: OrgRole) => {
    setPage(1);
    setRole(role);
  };

  const onChangeCreated = (e?: [Moment, Moment]) => {
    setPage(1);
    if (e) {
      const startAt = e[0]?.startOf("day");
      const endAt = e[1]?.endOf("day");
      setCreatedDateRange([startAt, endAt]);
    } else {
      setCreatedDateRange(undefined);
    }
  };

  const onChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const onRemoveOrgMember = async (userId: number) => {
    await removeOrgMember({
      variables: {
        userId,
      },
    });
    toast.success(t`Remove member successfully!`);
  };

  const onClickDeleteMember = async (userId: number) => {
    removeOrgMemberModal.confirm({
      title: t`Do you want to delete member?`,
      onOk: () => onRemoveOrgMember(userId),
      bodyStyle: {
        padding: "20px",
      },
    });
  };

  const organizationOwnerId = useOrganizationStore(state => state.organization?.ownerId);
  const columns = [
    {
      title: t`Role`,
      dataIndex: "orgRole",
      key: "orgRole",
      render: (role: OrgRole, member: IMember) => {
        if (member.userId === organizationOwnerId) {
          return (
            <Tag color="magenta">
              <Trans>OWNER</Trans>
            </Tag>
          );
        }

        return <Tag color={getRoleColor(role)}>{getRoleName(role)}</Tag>;
      },
    },
    {
      title: t`Name`,
      key: "name",
      width: 200,
      render: (_, member: IMember) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setActiveMember(member.userId)}
        >
          <AvatarWithName
            name={member.personalInformation?.fullName}
            avtUrl={member.personalInformation?.avatar?.publicUrl}
            strong
            color={member.user.randomColor}
          />
        </div>
      ),
    },
    {
      title: t`Email`,
      key: "email",
      render: (_, member: IMember) => (
        <Text level={2}>{member.user.email}</Text>
      ),
    },
    {
      title: t`Classes`,
      key: "class",
      render: (_, member: IMember) =>
        member.user.classMembers.map((m) => {
          return (
            <Tag
              key={m.classId}
              onClick={() => router.push(formatDocumentRoute(m.class.starterDocument.documentId))}
              style={{ cursor: "pointer" }}
              color={"#108ee9"}
            >
              {m.class.name}
            </Tag>
          );
        }),
    },
    {
      title: t`Added at`,
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (_, member: IMember) => (
        <Text level={2}>
          {formatDate(member.user.createdAt, FormatType.DateTimeFormat)}
        </Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 5,
      render: (_, member: IMember) => {
        if (member.userId === organizationOwnerId) {
          return null;
        }

        return (
          <Dropdown
            trigger={["click"]}
            placement={"bottomRight"}
            menu={{
              items: [
                {
                  key: "info",
                  onClick: () => setActiveMember(member.userId),
                  label: t`Edit information`,
                },
                {
                  key: "delete",
                  onClick: () => onClickDeleteMember(member.userId),
                  label: <Trans>Remove Member</Trans>,
                  danger: true,
                },
              ],
            }}
          >
            <StyledMoreOutlined onClick={(e) => e.stopPropagation()} />
          </Dropdown>
        );
      },
    },
  ];

  if (!authUser) {
    return <Loading />;
  }

  return (
    <div>
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <Card bordered={false}>
              <Statistic
                title={t`Teacher`}
                value={orgStats?.orgMemberStats?.totalTeacher || 0}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered={false}>
              <Statistic
                title={t`Student`}
                value={orgStats?.orgMemberStats?.totalStudent || 0}
              />
            </Card>
          </Col>
        </Row>
      </div>
      <Divider />
      <div
        style={{
          marginBottom: "15px",
          display: "flex",
        }}
      >
        <Card
          style={{
            width: "300px",
            backgroundColor: "#FFFFFF",
            marginRight: 10,
            height: "fit-content",
          }}
        >
          <Text strong>
            <Trans>Search</Trans>&nbsp;
          </Text>
          <div>
            <Input.Search
              onChange={(e) => onchangeKeyword(e.currentTarget.value)}
              placeholder={t`Type to search`}
              allowClear
            />
          </div>
          <Divider />
          <div style={{ marginTop: "5px" }}>
            <Text strong>
              <Trans>Filter by role</Trans>&nbsp;
            </Text>
            <Select
              style={{ width: "100%" }}
              value={role}
              onChange={onChangeRole}
              allowClear
              placeholder={t`Select Role`}
            >
              {roles.map((role) => (
                <Select.Option value={role.role} key={role.role}>
                  {role.content}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Divider />
          <div>
            <Text strong>
              <Trans>Filter by added at</Trans>&nbsp;
            </Text>
            <DateRangePicker
              onChange={onChangeCreated}
              value={createdDateRange}
              format={FormatType.DateFormat}
              picker="date"
              allowClear
            />
          </div>
        </Card>
        <div style={{ flex: 1 }}>
          <Table
            rowKey={"userId"}
            loading={loading}
            columns={columns}
            dataSource={members}
            pagination={{
              pageSize: MEMBER_PER_PAGE,
              current: page,
              total,
              showSizeChanger: false,
              onChange: onChangePage,
            }}
          />
        </div>
      </div>
      {removeOrgMemberContextHolder}
    </div>
  );
};

export default OrganizationMembersTab;
