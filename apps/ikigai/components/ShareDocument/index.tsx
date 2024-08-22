import {
  Button,
  DataList,
  Heading,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { useQuery } from "@apollo/client";

import { GET_SHARED_DOCUMENT } from "graphql/query/DocumentQuery";
import Loading from "../Loading";
import { GetSharedDocument } from "graphql/types";
import TestDurationAttribute from "../Document/DocumentBody/CoverPage/AssignmentCoverPageBody/GeneralInformation/TestDurationAttribute";
import { useState } from "react";
import Modal from "../base/Modal";

export type ShareDocumentProps = {
  sessionId?: string;
  documentId?: string;
  readOnly?: boolean;
};

const ShareDocument = ({
  sessionId,
  documentId,
  readOnly,
}: ShareDocumentProps) => {
  const [error, setError] = useState("");
  const { data, loading } = useQuery<GetSharedDocument>(GET_SHARED_DOCUMENT, {
    skip: !sessionId || !documentId || readOnly,
    variables: {
      documentId,
      sessionId,
    },
    onError: (error) => setError(error.message),
  });

  if (loading) {
    return <Loading />;
  }

  const shouldShowError = readOnly === undefined || !readOnly;
  const totalQuiz = data?.documentGetSharedInfoBySession?.assignment?.totalQuiz;
  const testDuration =
    data?.documentGetSharedInfoBySession?.assignment?.testDuration || 0;
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
          Fill all the information and click do the assignment to start.
        </Trans>
      </Text>
      <div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <Text weight="bold">Email</Text>
          <TextField.Root
            placeholder={t`Typing your email`}
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <Button size="2" style={{ width: "100%" }} disabled={readOnly}>
            Do the assignment
          </Button>
        </div>
      </div>
      {error && shouldShowError && (
        <Modal
          content={<Text color="red">{error}</Text>}
          title={t`Cannot load embedded assignment!`}
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
