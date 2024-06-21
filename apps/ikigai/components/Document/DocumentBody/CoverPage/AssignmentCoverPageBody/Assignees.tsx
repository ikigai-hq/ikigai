import { useMutation, useQuery } from "@apollo/client";
import {
  Badge,
  Button,
  IconButton,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { useState } from "react";
import toast from "react-hot-toast";
import validator from "validator";
import { Cross2Icon, MinusIcon } from "@radix-ui/react-icons";

import { GET_DOCUMENT_ASSIGNEE } from "graphql/query/DocumentQuery";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "store/DocumentStore";
import UserBasicInformation from "components/UserBasicInformation";
import { GetDocumentAssignees } from "graphql/types";
import Loading from "components/Loading";
import {
  ASSIGN_TO_STUDENTS,
  REMOVE_ASSIGNEE,
} from "graphql/mutation/DocumentMutation";
import { formatTimestamp, FormatType } from "util/Time";
import Modal from "components/base/Modal";
import AlertDialog from "components/base/AlertDialog";

const Assignees = () => {
  const documentId = useDocumentStore((state) => state.activeDocumentId);
  const [emails, setEmails] = useState([]);
  const { data, loading, refetch } = useQuery<GetDocumentAssignees>(
    GET_DOCUMENT_ASSIGNEE,
    {
      onError: handleError,
      variables: {
        documentId,
      },
      fetchPolicy: "network-only",
    },
  );

  const [addAssignees, { loading: createLoading }] = useMutation(
    ASSIGN_TO_STUDENTS,
    {
      onError: handleError,
    },
  );

  const [removeAssignee] = useMutation(REMOVE_ASSIGNEE, {
    onError: handleError,
  });

  const onConfirmAssign = async () => {
    const { data } = await addAssignees({
      variables: {
        documentId,
        emails,
      },
    });

    if (data) {
      refetch({ documentId });
      toast.success(t`Assigned!`);
    }
  };

  const onConfirmRemove = async (userId: number) => {
    const { data } = await removeAssignee({
      variables: {
        documentId,
        userId,
      },
    });

    if (data) {
      refetch({ documentId });
      toast.success(t`Removed!`);
    }
  };

  if (loading || !data) return <Loading />;

  return (
    <div>
      <Modal
        content={<AssignModal emails={emails} onChangeEmails={setEmails} />}
        onOk={onConfirmAssign}
        okText={t`Assign`}
      >
        <Button disabled={createLoading} loading={createLoading}>
          <Trans>Assign to students</Trans>
        </Button>
      </Modal>
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
        {data.documentGetAssignees.map((assignee) => (
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
                onConfirm={() => onConfirmRemove(assignee.user.id)}
              >
                <Button variant="ghost" color="red">
                  <MinusIcon /> Remove
                </Button>
              </AlertDialog>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Root>
    </div>
  );
};

type AssignModalProps = {
  emails: string[];
  onChangeEmails: (emails: string[]) => void;
};

const AssignModal = (props: AssignModalProps) => {
  const [innerEmail, setInnerEmail] = useState("");

  const onChangeValue = (emailStr: string) => {
    if (emailStr.includes(" ")) {
      handleChangeEmails(emailStr);
      return;
    }
    setInnerEmail(emailStr);
  };

  const handleChangeEmails = (emailStr: string) => {
    setInnerEmail("");
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
      <div>
        {props.emails.map((email, index) => (
          <Badge key={email} radius="full" style={{ margin: 2 }}>
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
        value={innerEmail}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleChangeEmails(innerEmail);
        }}
      />
    </div>
  );
};

export default Assignees;
