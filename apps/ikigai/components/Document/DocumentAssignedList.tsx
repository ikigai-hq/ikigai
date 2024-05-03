import Modal from "../common/Modal";
import { t, Trans } from "@lingui/macro";
import { Button, Select, Table, Typography } from "antd";
import useDocumentStore from "context/ZustandDocumentStore";
import { ColumnsType } from "antd/es/table";
import {
  AssignToDocument,
  GetDocumentAssignedUsers_documentGet_assignedUsers as IAssignedUser,
} from "graphql/types";
import UserBasicInformation from "../UserBasicInformation";
import { useState } from "react";
import validator from "validator";
import { useMutation } from "@apollo/client";
import { ASSIGN_TO_DOCUMENT } from "../../graphql/mutation/DocumentMutation";
import { handleError } from "../../graphql/ApolloClient";
import toast from "react-hot-toast";
import { cloneDeep } from "lodash";

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
  const [assignToDocument, { loading }] = useMutation<AssignToDocument>(
    ASSIGN_TO_DOCUMENT,
    {
      onError: handleError,
    },
  );

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
      <Table columns={columns} dataSource={assignedUsers} />
    </Modal>
  );
};

export default DocumentAssignedList;
