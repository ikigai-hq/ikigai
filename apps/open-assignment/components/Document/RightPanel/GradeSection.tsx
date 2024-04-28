import { Divider, InputNumber } from "antd";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import toast from "react-hot-toast";

import useDocumentStore from "context/ZustandDocumentStore";
import useUserPermission from "hook/UseUserPermission";
import { Permission } from "util/permission";
import { Button } from "components/common/Button";
import { Text } from "components/common/Text";
import { Input } from "components/common/Input";
import { useEffect, useState } from "react";
import {
  TeacherRequestRedo,
  TeacherRequestRedoVariables,
  TeacherReviewSubmission,
  TeacherReviewSubmissionVariables,
} from "graphql/types";
import {
  TEACHER_REQUEST_REDO,
  TEACHER_REVIEW_SUBMISSION,
} from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";
import { t, Trans } from "@lingui/macro";
import { useCorrectAnswers } from "hook/UseCorrectAnswers";

export type GradeSectionProps = {
  rubricFinalScore: number;
};

const GradeSection = ({ rubricFinalScore }: GradeSectionProps) => {
  const [reviewSubmission, { loading }] = useMutation<TeacherReviewSubmission>(
    TEACHER_REVIEW_SUBMISSION,
    {
      onError: handleError,
    },
  );
  const [requestRedo, { loading: requestRedoLoading }] =
    useMutation<TeacherRequestRedo>(TEACHER_REQUEST_REDO, {
      onError: handleError,
    });
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const correctAnswers = useCorrectAnswers();
  const userAllow = useUserPermission();

  const [finalGrade, setFinalGrade] = useState(
    activeDocument?.submission?.finalGrade || rubricFinalScore,
  );
  const [feedback, setFeedback] = useState(
    activeDocument?.submission?.feedback || "",
  );

  useEffect(() => {
    setFinalGrade(rubricFinalScore);
  }, [rubricFinalScore]);

  if (!activeDocument || !activeDocument.submission) return null;

  const update = async () => {
    const variables: TeacherReviewSubmissionVariables = {
      submissionId: activeDocument.submission.id,
      gradeData: {
        tempGrade: correctAnswers,
        finalGrade,
        feedback,
      },
    };
    const { data } = await reviewSubmission({ variables });
    if (data) toast.success(t`Graded!`);
  };

  const requestRedoAssignment = async () => {
    const variables: TeacherRequestRedoVariables = {
      submissionId: activeDocument.submission.id,
    };
    const { data } = await requestRedo({ variables });
    if (data) toast.success(t`Request student redo successfully!`);
  };

  return (
    <>
      <Section>
        <Divider />
        <TextWrapper>
          <LeftTextWrapper>
            <Text type="secondary">
              <Trans>Grade</Trans>
            </Text>
          </LeftTextWrapper>
          <RightTextWrapper>
            <InputNumber
              size={"small"}
              readOnly={!userAllow(Permission.ManageSpaceContent)}
              value={finalGrade}
              onChange={(value) => setFinalGrade(value)}
            />
          </RightTextWrapper>
        </TextWrapper>
        <div style={{ marginTop: "15px" }}>
          {userAllow(Permission.ManageSpaceContent) ? (
            <Input.TextArea
              placeholder={t`Type your feedback`}
              readOnly={!userAllow(Permission.ManageSpaceContent)}
              value={feedback}
              onChange={(e) => setFeedback(e.currentTarget.value)}
              rows={7}
            />
          ) : (
            <Text>{feedback}</Text>
          )}
        </div>
      </Section>
      {userAllow(Permission.ManageSpaceContent) && (
        <Button
          customWidth={"100%"}
          style={{ marginTop: "15px" }}
          loading={loading}
          disabled={loading}
          onClick={update}
          type="primary"
        >
          <Trans>Grade</Trans>
        </Button>
      )}
      {userAllow(Permission.ManageSpaceContent) && (
        <Button
          customWidth={"100%"}
          style={{ marginTop: "15px" }}
          loading={requestRedoLoading}
          disabled={requestRedoLoading}
          onClick={requestRedoAssignment}
        >
          <Trans>Request to redo</Trans>
        </Button>
      )}
    </>
  );
};

const TextWrapper = styled.div`
  display: flex;
`;

const LeftTextWrapper = styled.div`
  flex: 1;
`;

const RightTextWrapper = styled.div`
  flex: 1;
  text-align: right;
`;

const Section = styled.div``;

export default GradeSection;
