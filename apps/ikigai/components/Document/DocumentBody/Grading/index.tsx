import styled from "styled-components";
import { Button, DataList, Separator, Text, TextArea } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { round } from "lodash";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";

import useDocumentStore from "store/DocumentStore";
import { formatTimestamp, FormatType } from "util/Time";
import InputNumber from "components/base/InputNumber";
import { TEACHER_REVIEW_SUBMISSION } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import usePermission from "hook/UsePermission";
import { SpaceActionPermission } from "graphql/types";

const Grading = () => {
  const allow = usePermission();
  const [grade, { loading }] = useMutation(TEACHER_REVIEW_SUBMISSION, {
    onError: handleError,
  });
  const submission = useDocumentStore(
    (state) => state.activeDocument.submission,
  );
  const [feedback, setFeedback] = useState(submission?.feedback || "");
  const [finalGrade, setFinalGrade] = useState(submission?.finalGrade);

  const onFeedback = async () => {
    const { data } = await grade({
      variables: {
        submissionId: submission.id,
        gradeData: {
          finalGrade,
          feedback,
        },
      },
    });

    if (data) toast.success(t`Feedback successfully!`);
  };

  if (!submission) return;

  return (
    <GradingWrapper>
      <Separator style={{ height: "100%", width: "1px" }} />
      <div style={{ flex: 1, height: "100%", padding: 10 }}>
        <Text size="3" weight="bold">
          <Trans>Grading</Trans>
        </Text>
        <div style={{ marginBottom: 10 }} />
        <DataList.Root>
          <DataList.Item>
            <DataList.Label>
              <Trans>Start at</Trans>
            </DataList.Label>
            <DataList.Value>
              {submission?.startAt
                ? formatTimestamp(submission.startAt, FormatType.DateTimeFormat)
                : ""}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label>
              <Trans>Submit at</Trans>
            </DataList.Label>
            <DataList.Value>
              {submission?.submitAt
                ? formatTimestamp(
                    submission.submitAt,
                    FormatType.DateTimeFormat,
                  )
                : ""}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label>
              <Trans>Feedback at</Trans>
            </DataList.Label>
            <DataList.Value>
              {submission?.feedbackAt
                ? formatTimestamp(
                    submission.feedbackAt,
                    FormatType.DateTimeFormat,
                  )
                : ""}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label>
              <Trans>Time completion</Trans>
            </DataList.Label>
            <DataList.Value>
              {submission.submitAt && submission.startAt
                ? `${round(
                    (submission.submitAt - submission.startAt) / 60,
                    0,
                  )} minutes`
                : ""}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <Separator style={{ width: "100%", marginTop: 10, marginBottom: 10 }} />
        <DataList.Root>
          <DataList.Item align="center">
            <DataList.Label>
              <Trans>Grade</Trans>
            </DataList.Label>
            <DataList.Value>
              <InputNumber
                value={finalGrade}
                onChange={setFinalGrade}
                precision={2}
                readOnly={!allow(SpaceActionPermission.MANAGE_SPACE_CONTENT)}
              />
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <TextArea
          style={{ marginTop: 10, marginBottom: 10 }}
          placeholder={t`Type your feedback...`}
          rows={10}
          value={feedback}
          onChange={(e) => setFeedback(e.currentTarget.value)}
          readOnly={!allow(SpaceActionPermission.MANAGE_SPACE_CONTENT)}
        />
        {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
          <Button
            style={{ float: "right" }}
            onClick={onFeedback}
            loading={loading}
            disabled={loading}
          >
            <PaperPlaneIcon /> <Trans>Feedback</Trans>
          </Button>
        )}
      </div>
    </GradingWrapper>
  );
};

const GradingWrapper = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
`;

export default Grading;
