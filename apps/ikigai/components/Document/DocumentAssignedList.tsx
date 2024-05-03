import { t, Trans } from "@lingui/macro";
import { Button, Popconfirm, Select, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import toast from "react-hot-toast";
import { cloneDeep } from "lodash";
import { DeleteOutlined } from "@ant-design/icons";

import {
  AssignToDocument,
  GetDocumentAssignedUsers_documentGet_assignedUsers as IAssignedUser,
} from "graphql/types";
import UserBasicInformation from "../UserBasicInformation";
import { useState } from "react";
import validator from "validator";
import { useMutation } from "@apollo/client";
import {
  ASSIGN_TO_DOCUMENT,
  REMOVE_DOCUMENT_ASSIGNED,
} from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { TextButtonWithHover } from "../common/Button";
import useDocumentStore from "context/ZustandDocumentStore";
import Modal from "../common/Modal";
import shallow from "zustand/shallow";

export type AssigneeListProps = {
  visible: boolean;
  onClose: () => void;
};

const DocumentAssignedList = ({ visible, onClose }: AssigneeListProps) => {
  const documentId = useDocumentStore((state) => state.masterDocumentId);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const assignedUsers = useDocumentStore((state) => state.assignedUsers);
  const addAssignedUsers = useDocumentStore((state) => state.addAssignedUsers);
  const removeAssignedUsers = useDocumentStore(
    (state) => state.removeAssignedUsers,
  );
  const [assignToDocument, { loading }] = useMutation<AssignToDocument>(
    ASSIGN_TO_DOCUMENT,
    {
      onError: handleError,
    },
  );
  const [removeAssignee] = useMutation(REMOVE_DOCUMENT_ASSIGNED, {
    onError: handleError,
  });

  const onSelect = (email: string) => {
    if (!validator.isEmail(email)) return;

    const lowercaseEmail = email.toLowerCase();
    if (selectedEmails.includes(lowercaseEmail)) return;

    selectedEmails.push(lowercaseEmail);
    setSelectedEmails([...selectedEmails]);
    setSearchValue("");
  };

  const onDeselect = (email: string) => {
    const lowercaseEmail = email.toLowerCase();
    const index = selectedEmails.indexOf(lowercaseEmail);
    if (index > -1) {
      selectedEmails.splice(index, 1);
    }
    setSelectedEmails([...selectedEmails]);
  };

  const assign = async () => {
    const { data } = await assignToDocument({
      variables: {
        documentId,
        emails: selectedEmails,
      },
    });
    if (data) {
      toast.success(t`Assigned!`);
      addAssignedUsers(cloneDeep(data.documentAssignUsers));
      setSelectedEmails([]);
    }
  };

  const remove = async (member: IAssignedUser) => {
    const { data } = await removeAssignee({
      variables: {
        assignedUser: {
          documentId,
          assignedUserId: member.assignedUserId,
        },
      },
    });

    if (data) {
      toast.success(t`Deleted!`);
      removeAssignedUsers([member]);
    }
  };

  const columns: ColumnsType<IAssignedUser> = [
    {
      title: t`Name`,
      dataIndex: "name",
      render: (_, member) => (
        <UserBasicInformation
          name={`${member.user.firstName} ${member.user.lastName}`}
          avatar={member.user.avatar?.publicUrl}
          randomColor={member.user.randomColor}
          email={member.user.email}
        />
      ),
    },
    {
      title: "",
      dataIndex: "action",
      width: 50,
      render: (_, member) => (
        <Popconfirm
          title={t`Remove assigned user`}
          onConfirm={() => remove(member)}
        >
          <TextButtonWithHover
            type="text"
            icon={<DeleteOutlined style={{ color: "red" }} />}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal visible={visible} onClose={onClose} title={t`Assign`}>
      <Typography.Text type="secondary">
        <Trans>
          When a person is assigned to this document, they will receive receive
          an email granting access to the document and enrolling them as a space
          student.
        </Trans>
      </Typography.Text>
      <div style={{ display: "flex", gap: 10 }}>
        <Select
          mode="tags"
          placeholder={t`Seperated by commas or space`}
          style={{ width: "100%" }}
          size="large"
          tokenSeparators={[",", " "]}
          onSelect={onSelect}
          onDeselect={onDeselect}
          value={selectedEmails}
          autoClearSearchValue={false}
          searchValue={searchValue}
          onSearch={setSearchValue}
          options={[]}
          suffixIcon={null}
        />
        <Button
          type="primary"
          size="large"
          onClick={assign}
          loading={loading}
          disabled={loading}
        >
          <Trans>Assign</Trans>
        </Button>
      </div>
      <Table
        rowKey="assignedUserId"
        columns={columns}
        dataSource={assignedUsers}
      />
    </Modal>
  );
};

export default DocumentAssignedList;
