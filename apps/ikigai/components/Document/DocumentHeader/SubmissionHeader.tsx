import { Button, Popconfirm } from "antd";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { IconLogout2 } from "@tabler/icons-react";

import { formatDocumentRoute } from "config/Routes";
import { Role, StudentSubmitSubmission } from "graphql/types";
import { STUDENT_SUBMIT_SUBMISSION } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "store/DocumentStore";
import useAuthUserStore from "store/AuthStore";

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

  return <></>;
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
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Popconfirm
        title={t`Do you want to submit your submission?`}
        onConfirm={onClickSubmit}
      >
        <Button type="primary">
          <Trans>Submit</Trans>
        </Button>
      </Popconfirm>
      <Button onClick={onClickSaveAndExit}>
        <Trans>Save & Exit</Trans>
      </Button>
    </div>
  );
};

const StudentNonDoingSubmissionHeader = () => {
  const router = useRouter();
  const assignmentDocumentId = useDocumentStore(
    (state) => state.activeDocument?.submission?.assignment?.documentId,
  );

  const onClickExit = () => {
    router.push(formatDocumentRoute(assignmentDocumentId));
  };

  return (
    <div>
      <Button
        style={{ display: "flex", alignItems: "center", gap: 4 }}
        icon={<IconLogout2 size={16} />}
        onClick={onClickExit}
      >
        <Trans>Back to space</Trans>
      </Button>
    </div>
  );
};
