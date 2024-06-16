import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { Button } from "@radix-ui/themes";
import { ExitIcon } from "@radix-ui/react-icons";
import { useTimer } from "react-timer-hook";
import styled from "styled-components";

import { formatDocumentRoute } from "config/Routes";
import { Role, StudentSubmitSubmission } from "graphql/types";
import { STUDENT_SUBMIT_SUBMISSION } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "store/DocumentStore";
import useAuthUserStore from "store/AuthStore";
import HeaderSubmissionUserInfo from "./HeaderSubmissionUserInfo";
import Modal from "components/base/Modal";
import { convertTsToDate } from "util/Time";
import AlertDialog from "components/base/AlertDialog";

const RightSubmissionHeader = () => {
  const role = useAuthUserStore((state) => state.role);
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );

  if (!submission) return <></>;

  if (role === Role.TEACHER) return <TeacherSubmissionHeader />;
  if (role === Role.STUDENT) return <StudentSubmissionHeader />;
};

export default RightSubmissionHeader;

export const StudentSubmissionHeader = () => {
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );

  if (!submission) return <></>;

  if (submission.feedbackAt || submission.submitAt)
    return <StudentNonDoingSubmissionHeader />;
  return <StudentDoingSubmissionHeader />;
};

export const TeacherSubmissionHeader = () => {
  const router = useRouter();
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );

  const backToAssignment = () => {
    router.push(formatDocumentRoute(submission.assignment.documentId));
  };

  return (
    <HeaderSubmissionWrapper>
      <HeaderSubmissionUserInfo />
      <Button variant="soft" onClick={backToAssignment}>
        <ExitIcon /> <Trans>Exit</Trans>
      </Button>
    </HeaderSubmissionWrapper>
  );
};

export const StudentDoingSubmissionHeader = () => {
  const router = useRouter();
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );
  const assignmentDocumentId = useDocumentStore(
    (state) => state.activeDocument?.submission?.assignment?.documentId,
  );
  const [submitSubmission] = useMutation<StudentSubmitSubmission>(
    STUDENT_SUBMIT_SUBMISSION,
    {
      onError: handleError,
    },
  );

  const onClickSubmit = async () => {
    const { data } = await submitSubmission({
      variables: {
        submissionId: submission?.id,
      },
    });
    if (data) {
      toast.success(t`Success`);
      await router.push(formatDocumentRoute(assignmentDocumentId));
    }
  };

  const onClickSaveAndExit = () => {
    router.push(formatDocumentRoute(assignmentDocumentId));
  };

  return (
    <HeaderSubmissionWrapper>
      <HeaderSubmissionUserInfo />
      <Button
        variant="outline"
        onClick={onClickSaveAndExit}
        style={{ marginLeft: 5 }}
      >
        <Trans>Save & Exit</Trans>
      </Button>
      <Modal
        title={t`Do you want to submit your submission?`}
        description={t`You cannot continue edit your submission after you submit.`}
        content={<></>}
        onOk={onClickSubmit}
        okText={t`Submit`}
      >
        <Button variant="solid">
          <Trans>Submit</Trans>
        </Button>
      </Modal>
    </HeaderSubmissionWrapper>
  );
};

export const TestDurationCountdown = () => {
  const router = useRouter();
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );
  const { seconds, hours, minutes, days, isRunning } = useTimer({
    expiryTimestamp: convertTsToDate(
      submission.startAt + submission.testDuration,
    ).toDate(),
  });

  const onConfirmExpire = () => {
    if (!submission) return;
    router.push(formatDocumentRoute(submission.assignment.documentId));
  };

  const finalMinutes = hours * 60 + days * 24 * 60 + minutes;

  return (
    <AlertDialog
      title={t`The test duration is complete!`}
      description={t`We will move you back to assignment page!`}
      onConfirm={onConfirmExpire}
      open={!isRunning}
      showCancel={false}
      confirmColor="indigo"
      confirmText={t`Submit`}
    >
      <Button variant="soft">
        {finalMinutes > 9 ? finalMinutes : `0${finalMinutes}`}:
        {seconds > 9 ? seconds : `0${seconds}`}
      </Button>
    </AlertDialog>
  );
};

const StudentNonDoingSubmissionHeader = () => {
  const router = useRouter();
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );

  const backToAssignment = () => {
    router.push(formatDocumentRoute(submission.assignment.documentId));
  };
  return (
    <HeaderSubmissionWrapper>
      <HeaderSubmissionUserInfo />
      <Button variant="soft" onClick={backToAssignment}>
        <ExitIcon /> <Trans>Exit</Trans>
      </Button>
    </HeaderSubmissionWrapper>
  );
};

const HeaderSubmissionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
