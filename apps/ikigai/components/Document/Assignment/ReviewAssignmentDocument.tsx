import { useRouter } from "next/router";
import React, { useEffect } from "react";

import {
  GetDocumentDetail_documentGet as IDocument,
  GetDocumentDetail_documentGet_assignment,
  StartSubmission,
  StudentRedoSubmission,
} from "graphql/types";
import { useMutation } from "@apollo/client";
import { handleError } from "graphql/ApolloClient";
import { Routes } from "config/Routes";
import useDocumentStore from "context/ZustandDocumentStore";
import {
  STUDENT_REDO_SUBMISSION,
  STUDENT_START_SUBMISSION,
} from "graphql/mutation";
import { Text, TextWeight } from "components/common/Text";
import { Button } from "components/common/Button";
import styled from "styled-components";
import { Trans, t } from "@lingui/macro";

import {
  DividerDocument,
  DocumentBody,
  DocumentTitle,
  StyledTitle,
} from "../common";
import { BreakPoints } from "styles/mediaQuery";
import { canDoAssignment } from "util/index";
import { ConfirmPopup } from "util/ConfirmPopup";
import { useModal } from "hook/UseModal";
import useQuizStore from "context/ZustandQuizStore";

export type StudentAssignmentDocumentProps = {
  doc: IDocument;
  assignment: GetDocumentDetail_documentGet_assignment;
};

const ReviewAssignmentDocument = ({
  doc,
  assignment,
}: StudentAssignmentDocumentProps) => {
  const { push } = useRouter();
  const [startSubmission, { loading: loadingStartSubmission }] =
    useMutation<StartSubmission>(STUDENT_START_SUBMISSION, {
      onError: handleError,
    });
  const [redoSubmission, { loading: redoLoading }] =
    useMutation<StudentRedoSubmission>(STUDENT_REDO_SUBMISSION, {
      onError: handleError,
    });
  const quizzes = useQuizStore((state) => state.quizzes);
  const setIsClose = useDocumentStore((state) => state.setIsClose);

  useEffect(() => {
    setIsClose(false);
  }, []);

  const testDurationText = assignment.testDuration
    ? `${Math.floor(assignment.testDuration / 60)} ${t`minutes`}`
    : t`Unlimited time`;
  const currentAttemptTime = assignment.mySubmission?.attemptNumber || 0;
  const maxNumberOfAttempt = assignment.maxNumberOfAttempt;
  const attemptTimes = maxNumberOfAttempt
    ? `${currentAttemptTime}/${maxNumberOfAttempt} (${t`Remaining`}: ${
        maxNumberOfAttempt - currentAttemptTime
      })`
    : t`Unlimited`;
  const isDoingSubmission =
    assignment.mySubmission && !assignment.mySubmission.submitAt;

  const doAssignmentCheckMessage = canDoAssignment(doc);
  const allowRework =
    assignment.mySubmission && assignment.mySubmission.allowRework;
  const shouldShowAttemptWarning = !!assignment.mySubmission;
  const { modal } = useModal();

  const handleClickLastSubmission = async () => {
    if (allowRework) {
      const { data } = await redoSubmission({
        variables: {
          submissionId: assignment.mySubmission.id,
        },
      });

      if (data && data.assignmentRedo) {
        push(
          Routes.DocumentDetail.replace(
            ":documentId",
            assignment.mySubmission.documentId.toString(),
          ),
        );
        return;
      }
    }

    push(
      Routes.DocumentDetail.replace(
        ":documentId",
        assignment.mySubmission.documentId.toString(),
      ),
    );
  };

  const onStartNewAttempt = async () => {
    if (shouldShowAttemptWarning) {
      modal.confirm(
        ConfirmPopup({
          title: t`New attempt`,
          content: t`New Attempt will remove answers in previous submission`,
          onOk: startNewAttempt,
        }) as any,
      );
      return;
    }

    await startNewAttempt();
  };

  const startNewAttempt = async () => {
    const { data } = await startSubmission({
      variables: {
        assignmentId: assignment.id,
      },
    });

    if (data && data.assignmentStartSubmission.documentId) {
      push(
        Routes.DocumentDetail.replace(
          ":documentId",
          data.assignmentStartSubmission.documentId.toString(),
        ),
      );
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <DocumentBody style={{ paddingLeft: "32px", paddingRight: "32px" }}>
        <DocumentTitle>
          <div style={{ minHeight: "70px" }}>
            <StyledTitle
              autoSize
              bordered={false}
              maxLength={255}
              value={doc.title}
              placeholder={t`Untitled`}
              readOnly
              style={{ minHeight: "70px" }}
            />
          </div>
          <div>
            <Text level={2} type="secondary">
              {quizzes.size} <Trans>questions</Trans> &#183; {testDurationText}
            </Text>
          </div>
          <div>
            <Text level={2} type="secondary">
              <Trans>Attempt rules</Trans>
              :
              <br />- <Trans>Attempt times</Trans>: {attemptTimes}
            </Text>
          </div>
        </DocumentTitle>
        <DividerDocument style={{ width: "100%", marginTop: "10px" }} />
        <DescriptionContainer>
          <div style={{ marginBottom: "8px" }}>
            <Text level={4} mLevel={3} weight={TextWeight.bold}>
              <Trans>Description</Trans>
            </Text>
          </div>
          <Text level={3}>{assignment.preDescription}</Text>
        </DescriptionContainer>
        {doAssignmentCheckMessage && (
          <div style={{ marginBottom: "8px" }}>
            <Text level={2} color="red">
              {doAssignmentCheckMessage}
            </Text>
          </div>
        )}
        <ButtonGroup>
          <Button
            disabled={!!doAssignmentCheckMessage}
            loading={loadingStartSubmission}
            type="primary"
            onClick={onStartNewAttempt}
          >
            <Trans>New attempt</Trans>
          </Button>
          {assignment.mySubmission && (
            <Button
              onClick={handleClickLastSubmission}
              loading={redoLoading}
              disabled={redoLoading}
            >
              {isDoingSubmission || allowRework
                ? t`Continue on last submission`
                : t`Review last submission`}
            </Button>
          )}
        </ButtonGroup>
      </DocumentBody>
    </div>
  );
};

const DescriptionContainer = styled.div`
  margin-bottom: 15px;

  ${BreakPoints.tablet} {
    margin-bottom: 140px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;

  button {
    width: max-content;
  }

  ${BreakPoints.tablet} {
    position: fixed;
    width: 100%;
    bottom: 0;
    left: 0;
    padding: 16px 20px;
    box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
    background: ${(props) => props.theme.colors.gray[0]};
    box-sizing: border-box;

    button {
      width: 100%;
    }
  }

  ${BreakPoints.mobile} {
    flex-direction: column;
  }
`;

export default ReviewAssignmentDocument;
