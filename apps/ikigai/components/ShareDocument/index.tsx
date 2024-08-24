import {
  Button,
  DataList,
  Heading,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import validator from "validator";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

import { GET_SHARED_DOCUMENT } from "graphql/query/DocumentQuery";
import Loading from "../Loading";
import { GetSharedDocument, ResponseEmbeddedForm } from "graphql/types";
import TestDurationAttribute from "../Document/DocumentBody/CoverPage/AssignmentCoverPageBody/GeneralInformation/TestDurationAttribute";
import Modal from "components/base/Modal";
import { RESPONSE_EMBEDDED_FORM } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { formatDocumentRoute } from "config/Routes";
import TokenStorage from "storage/TokenStorage";

export type ShareDocumentProps = {
  sessionId: string;
  documentId: string;
  readOnly?: boolean;
};

const ShareDocument = ({
  sessionId,
  documentId,
  readOnly,
}: ShareDocumentProps) => {
  const router = useRouter();
  const [responseForm, { loading: responseLoading }] =
    useMutation<ResponseEmbeddedForm>(RESPONSE_EMBEDDED_FORM, {
      onError: handleError,
    });
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { data, loading } = useQuery<GetSharedDocument>(GET_SHARED_DOCUMENT, {
    skip: !sessionId || !documentId,
    variables: {
      documentId,
      sessionId,
    },
    onError: (error) => setError(error.message),
  });

  if (loading) {
    return <Loading />;
  }

  const onChangeEmail = (email: string) => {
    if (readOnly) return;
    setEmail(email);
  };

  const onChangePhoneNumber = (phoneNumber: string) => {
    if (readOnly) return;
    setPhoneNumber(phoneNumber);
  };

  const onChangeName = (name: string) => {
    if (readOnly) return;
    setName(name);
  };

  const onDoAssignment = async () => {
    if (readOnly) return;

    if (!validator.isEmail(email)) {
      toast.error(t`Wrong email format!`);
      return;
    }

    if (!validator.isMobilePhone(phoneNumber)) {
      toast.error(t`Wrong phone number format!`);
      return;
    }

    const { data } = await responseForm({
      variables: {
        response: {
          sessionId,
          responseData: {
            email,
            phoneNumber,
            firstName: name,
            lastName: "",
            additionalData: {},
          },
        },
      },
    });

    if (data && data.documentResponseEmbeddedForm.submission) {
      TokenStorage.set(data.documentResponseEmbeddedForm.accessToken);
      const baseUrl = formatDocumentRoute(
        data.documentResponseEmbeddedForm.submission.documentId,
      );
      router.push(baseUrl);
    }
  };

  const shouldShowError = readOnly === undefined || !readOnly;
  const totalQuiz = data?.documentGetSharedInfoBySession?.assignment?.totalQuiz;
  const testDuration =
    data?.documentGetSharedInfoBySession?.assignment?.testDuration;
  const maxAttempt =
    data?.documentGetSharedInfoBySession?.assignment?.maxNumberOfAttempt || 1;
  const title =
    data?.documentGetSharedInfoBySession?.document?.title || "Untitled";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        maxWidth: "50vw",
      }}
    >
      <div>
        <Heading>{title}</Heading>
        <DataList.Root size="1">
          <DataList.Item>
            <DataList.Label minWidth="88px">Test Duration</DataList.Label>
            <DataList.Value>
              <TestDurationAttribute testDuration={testDuration} readOnly />
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="88px">Quizzes</DataList.Label>
            <DataList.Value>
              {totalQuiz || 0} {totalQuiz > 1 ? "quizzes" : "quiz"}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="88px">Max attempt</DataList.Label>
            <DataList.Value>{maxAttempt}</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </div>
      <Separator style={{ width: "100%" }} />
      <Text color="gray" size="2">
        <Trans>
          Fill in all the information and click 'Do the Assignment' to start.
        </Trans>
      </Text>
      <div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <Text weight="bold">Email</Text>
          <TextField.Root
            placeholder={t`Typing your email`}
            value={email}
            onChange={(e) => onChangeEmail(e.currentTarget.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            marginTop: 10,
          }}
        >
          <Text weight="bold">Phone Number</Text>
          <TextField.Root
            placeholder={t`Typing your phone number`}
            value={phoneNumber}
            onChange={(e) => onChangePhoneNumber(e.currentTarget.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            marginTop: 10,
          }}
        >
          <Text weight="bold">Your Name</Text>
          <TextField.Root
            placeholder={t`Typing your name`}
            value={name}
            onChange={(e) => onChangeName(e.currentTarget.value)}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <Button
            size="2"
            style={{ width: "100%" }}
            onClick={onDoAssignment}
            disabled={responseLoading}
            loading={responseLoading}
          >
            <Trans>Do the Assignment</Trans>
          </Button>
        </div>
      </div>
      {error && shouldShowError && (
        <Modal
          content={<Text color="red">{error}</Text>}
          title={t`Failed to load embedded assignment!`}
          description={t`We've encountered an error while loading the assignment.`}
          open={!!error}
          showClose={false}
          okText={t`Back to Home`}
          onOk={() => {
            window.location.href = "/";
          }}
        >
          <></>
        </Modal>
      )}
    </div>
  );
};

export default ShareDocument;
