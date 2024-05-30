import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { Button } from "@radix-ui/themes";

import { formatDocumentRoute } from "config/Routes";
import { Role, StudentSubmitSubmission } from "graphql/types";
import { STUDENT_SUBMIT_SUBMISSION } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "store/DocumentStore";
import useAuthUserStore from "store/AuthStore";
import HeaderSubmissionUserInfo from "./HeaderSubmissionUserInfo";
import styled from "styled-components";
import Modal from "@/components/base/Modal";

const SubmissionHeader = () => {
  const role = useAuthUserStore((state) => state.role);

  if (role === Role.TEACHER) return <TeacherSubmissionHeader />;
  if (role === Role.STUDENT) return <StudentSubmissionHeader />;
};

export default SubmissionHeader;

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
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );
  if (!submission) return <></>;

  return (
    <HeaderSubmissionWrapper>
      <HeaderSubmissionUserInfo />
    </HeaderSubmissionWrapper>
  );
};

export const StudentDoingSubmissionHeader = () => {
  const router = useRouter();
  const submissionId = useDocumentStore(
    (state) => state.activeDocument?.submission?.id,
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
        submissionId,
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
        description={t`You cannot revert this action.`}
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

const StudentNonDoingSubmissionHeader = () => {
  return (
    <HeaderSubmissionWrapper>
      <HeaderSubmissionUserInfo />
    </HeaderSubmissionWrapper>
  );
};

const HeaderSubmissionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
