import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  Table,
  Text,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { Cross2Icon, RocketIcon } from "@radix-ui/react-icons";
import styled from "styled-components";
import { t, Trans } from "@lingui/macro";
import { useState } from "react";
import validator from "validator";
import Modal from "components/base/Modal";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";

import {
  ASSIGN_TO_STUDENTS,
  REMOVE_ASSIGNEE,
} from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "store/DocumentStore";
import {
  GetDocumentAssignees,
  GetDocumentAssignees_documentGetAssignees as IAssignee,
} from "graphql/types";
import { GET_DOCUMENT_ASSIGNEE } from "graphql/query/DocumentQuery";
import UserBasicInformation from "components/UserBasicInformation";
import { formatTimestamp, FormatType } from "util/Time";
import AlertDialog from "components/base/AlertDialog";

const AssigneesAttribute = () => {
  const documentId = useDocumentStore((state) => state.activeDocumentId);
  const [openAssigneesList, setOpenAssigneesList] = useState(false);
  const [innerEmail, setInnerEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const { data, refetch } = useQuery<GetDocumentAssignees>(
    GET_DOCUMENT_ASSIGNEE,
    {
      onError: handleError,
      variables: {
        documentId,
      },
      fetchPolicy: "network-only",
    },
  );

  const [addAssignees, { loading: assignLoading }] = useMutation(
    ASSIGN_TO_STUDENTS,
    {
      onError: handleError,
    },
  );

  const onConfirmAssign = async () => {
    const finalEmails = emails;
    if (validator.isEmail(innerEmail)) {
      finalEmails.push(innerEmail);
    }

    const { data } = await addAssignees({
      variables: {
        documentId,
        emails: finalEmails,
      },
    });

    if (data) {
      refetch({ documentId });
      toast.success(t`Assigned!`);
    }
  };

  const assignees = cloneDeep(data?.documentGetAssignees || []);
  const firstTwoAssignees = assignees.splice(0, 2);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 2 }}>
        {firstTwoAssignees.map((assignee) => (
          <Tooltip
            content={assignee.user.name}
            side="bottom"
            key={assignee.user.id}
          >
            <StudentAvatarWrapper onClick={() => setOpenAssigneesList(true)}>
              <Avatar
                size="1"
                fallback={assignee.user.name.charAt(0)}
                radius="full"
              />
            </StudentAvatarWrapper>
          </Tooltip>
        ))}
        {assignees.length > 0 && (
          <Tooltip content={t`${assignees.length} students`} side="bottom">
            <StudentAvatarWrapper onClick={() => setOpenAssigneesList(true)}>
              <Avatar
                fallback={
                  <Box width="16px" height="16px">
                    <svg viewBox="0 0 64 64" fill="currentColor">
                      <path d="M41.5 14c4.687 0 8.5 4.038 8.5 9s-3.813 9-8.5 9S33 27.962 33 23 36.813 14 41.5 14zM56.289 43.609C57.254 46.21 55.3 49 52.506 49c-2.759 0-11.035 0-11.035 0 .689-5.371-4.525-10.747-8.541-13.03 2.388-1.171 5.149-1.834 8.07-1.834C48.044 34.136 54.187 37.944 56.289 43.609zM37.289 46.609C38.254 49.21 36.3 52 33.506 52c-5.753 0-17.259 0-23.012 0-2.782 0-4.753-2.779-3.783-5.392 2.102-5.665 8.245-9.472 15.289-9.472S35.187 40.944 37.289 46.609zM21.5 17c4.687 0 8.5 4.038 8.5 9s-3.813 9-8.5 9S13 30.962 13 26 16.813 17 21.5 17z" />
                    </svg>
                  </Box>
                }
                size="1"
                radius="full"
              />
            </StudentAvatarWrapper>
          </Tooltip>
        )}
      </div>

      <Modal
        content={
          <AssignModal
            innerEmail={innerEmail}
            setInnerEmail={setInnerEmail}
            emails={emails}
            onChangeEmails={setEmails}
          />
        }
        onOk={onConfirmAssign}
        okText={t`Assign`}
        title={t`Assign assignment`}
      >
        <Button
          size="1"
          variant="soft"
          loading={assignLoading}
          disabled={assignLoading}
          style={{ marginLeft: firstTwoAssignees.length > 0 ? 5 : 0 }}
        >
          <RocketIcon /> Assign Students
        </Button>
      </Modal>
      <Modal
        content={
          <AssigneesList
            assignees={data?.documentGetAssignees}
            documentId={documentId}
            afterDelete={() => {
              refetch({ documentId });
            }}
          />
        }
        open={openAssigneesList}
        onOpenChange={setOpenAssigneesList}
      >
        <></>
      </Modal>
    </div>
  );
};

type AssignModalProps = {
  emails: string[];
  onChangeEmails: (emails: string[]) => void;
  innerEmail: string;
  setInnerEmail: (email: string) => void;
};

const AssignModal = (props: AssignModalProps) => {
  const onChangeValue = (emailStr: string) => {
    if (emailStr.includes(" ")) {
      handleChangeEmails(emailStr);
      return;
    }
    props.setInnerEmail(emailStr);
  };

  const handleChangeEmails = (emailStr: string) => {
    props.setInnerEmail("");
    const emails = emailStr.split(" ");
    const realEmails = emails
      .filter((email) => validator.isEmail(email.trim()))
      .map((email) => email.trim().toLowerCase());
    props.onChangeEmails([...new Set([...props.emails, ...realEmails])]);
  };

  const onRemoveEmail = (index: number) => {
    props.emails.splice(index, 1);
    props.onChangeEmails([...props.emails]);
  };

  return (
    <div>
      <div>
        <Text size="2" color="gray">
          Assignees will receive an notification email with a magic link that
          can can access directly to this assignment.
        </Text>
      </div>
      <div style={{ marginBottom: 5 }}>
        {props.emails.map((email, index) => (
          <Badge size="3" key={email} radius="full" style={{ margin: 2 }}>
            {email}{" "}
            <IconButton
              variant="ghost"
              size="1"
              color="red"
              highContrast={true}
              onClick={() => onRemoveEmail(index)}
            >
              <Cross2Icon />
            </IconButton>
          </Badge>
        ))}
      </div>
      <TextField.Root
        placeholder={t`Type or paste emails, separate by space or comma`}
        onChange={(e) => onChangeValue(e.currentTarget.value)}
        value={props.innerEmail}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleChangeEmails(props.innerEmail);
        }}
      />
    </div>
  );
};

export type AssigneesModalProps = {
  documentId: string;
  assignees: IAssignee[];
  afterDelete?: (assignee: IAssignee) => void;
};

const AssigneesList = ({
  documentId,
  assignees,
  afterDelete,
}: AssigneesModalProps) => {
  const [removeAssignee] = useMutation(REMOVE_ASSIGNEE, {
    onError: handleError,
  });

  const onConfirmRemove = async (assignee: IAssignee) => {
    const { data } = await removeAssignee({
      variables: {
        documentId,
        userId: assignee.user.id,
      },
    });

    if (data) {
      if (afterDelete) afterDelete(assignee);
      toast.success(t`Removed!`);
    }
  };

  return (
    <Table.Root>
      <Table.Header>
        <Table.ColumnHeaderCell>
          <Trans>Name</Trans>
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>
          <Trans>Assign at</Trans>
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell />
      </Table.Header>
      {assignees.map((assignee) => (
        <Table.Row key={assignee.user.id} align="center">
          <Table.Cell>
            <UserBasicInformation
              name={assignee.user.name}
              avatar={assignee.user.avatar?.publicUrl}
            />
          </Table.Cell>
          <Table.Cell>
            {formatTimestamp(assignee.createdAt, FormatType.DateTimeFormat)}
          </Table.Cell>
          <Table.Cell>
            <AlertDialog
              title={t`Remove assignee ${assignee.user.name}!`}
              description={t`This action cannot revert. Do you want to remove this assignee?`}
              onConfirm={() => onConfirmRemove(assignee)}
            >
              <Button variant="ghost" color="red">
                Remove
              </Button>
            </AlertDialog>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Root>
  );
};

export const StudentAvatarWrapper = styled.div`
  cursor: pointer;
`;

export default AssigneesAttribute;
