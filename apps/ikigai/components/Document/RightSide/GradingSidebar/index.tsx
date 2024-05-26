import { Button, Divider, InputNumber, Typography } from "antd";
import { useState } from "react";
import { t, Trans } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { round } from "lodash";

import { Input } from "components/common/Input";
import usePermission from "hook/UsePermission";
import { SpaceActionPermission } from "graphql/types";
import { TEACHER_REVIEW_SUBMISSION } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "store/DocumentStore";

const GradingSidebar = () => {
  const allow = usePermission();
  const [feedbackSubmission, { loading }] = useMutation(
    TEACHER_REVIEW_SUBMISSION,
    {
      onError: handleError,
    },
  );
  const canFeedback = allow(SpaceActionPermission.MANAGE_SPACE_CONTENT);
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );
  const [feedback, setFeedback] = useState(submission?.feedback);
  const [grade, setGrade] = useState(submission?.finalGrade);

  const onGrade = async () => {
    const { data } = await feedbackSubmission({
      variables: {
        submissionId: submission?.id,
        gradeData: {
          finalGrade: grade,
          feedback,
        },
      },
    });

    if (data) toast.success(t`Graded!`);
  };

  return (
    <div
      style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div>
        <Typography.Text strong type="secondary">
          <Trans>Grade</Trans>
        </Typography.Text>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <Typography.Text type="secondary">
            <Trans>Final Grade</Trans>
          </Typography.Text>
        </div>
        <div>
          <InputNumber
            size="small"
            min={0}
            readOnly={!canFeedback}
            value={round(grade, 2)}
            onChange={(value) => setGrade(round(value, 2))}
          />
        </div>
      </div>
      <div>
        <Input.TextArea
          autoSize={{
            minRows: 5,
            maxRows: 10,
          }}
          placeholder={t`Type your feedback...`}
          readOnly={!canFeedback}
          value={feedback}
          onChange={(e) => setFeedback(e.currentTarget.value)}
        />
      </div>
      {canFeedback && (
        <div>
          <Divider />
          <Button
            type="primary"
            style={{ width: "100%" }}
            loading={loading}
            disabled={loading}
            onClick={onGrade}
          >
            <Trans>Grade</Trans>
          </Button>
        </div>
      )}
    </div>
  );
};

export default GradingSidebar;
