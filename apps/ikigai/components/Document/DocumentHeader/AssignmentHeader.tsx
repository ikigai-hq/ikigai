import styled from "styled-components";
import { Button, Tooltip } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import { FilePlusIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";

import useAuthUserStore from "store/AuthStore";
import { Role, StartSubmission } from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import { STUDENT_START_SUBMISSION } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import { formatDocumentRoute } from "config/Routes";
import AlertDialog from "components/base/AlertDialog";

const AssignmentHeader = () => {
  const role = useAuthUserStore((state) => state.role);
  if (role === Role.STUDENT)
    return (
      <HeaderWrapper>
        <StudentAssignmentHeader />
      </HeaderWrapper>
    );

  return <></>;
};

const StudentAssignmentHeader = () => {
  const router = useRouter();
  const assignmentId = useDocumentStore(
    (state) => state.activeDocument?.assignment?.id,
  );
  const mySubmissions = useDocumentStore((state) => state.submissions);
  const maxAttempt = useDocumentStore(
    (state) => state.activeDocument?.assignment?.maxNumberOfAttempt,
  );
  const [startSubmission, { loading }] = useMutation<StartSubmission>(
    STUDENT_START_SUBMISSION,
    {
      onError: handleError,
    },
  );

  const onStartSubmission = async () => {
    const { data } = await startSubmission({
      variables: {
        assignmentId,
      },
    });

    if (data) {
      router.push(
        formatDocumentRoute(data.assignmentStartSubmission.documentId),
      );
    }
  };

  const canStartSubmission = (): string | undefined => {
    const lastSubmission = mySubmissions.sort(
      (a, b) => b.attemptNumber - a.attemptNumber,
    )[0];
    if (!lastSubmission) return;
    if (lastSubmission.feedbackAt)
      return t`Your last submission already has feedback. Please check it!`;

    if (!maxAttempt) return;
    if (lastSubmission.attemptNumber >= maxAttempt)
      return t`You reach max attempt times for this assignment!`;
  };

  const startSubmissionCheck = canStartSubmission();
  return (
    <>
      {startSubmissionCheck && (
        <Tooltip content={startSubmissionCheck}>
          <Button disabled>
            <FilePlusIcon /> <Trans>New Attempt</Trans>
          </Button>
        </Tooltip>
      )}
      {!startSubmissionCheck && (
        <AlertDialog
          title={t`New Attempt!`}
          description={t`Do you want to start new attempt?`}
          onConfirm={onStartSubmission}
          confirmText={t`New attempt`}
          confirmColor={"indigo"}
        >
          <Button loading={loading} disabled={loading}>
            <FilePlusIcon /> <Trans>New Attempt</Trans>
          </Button>
        </AlertDialog>
      )}
    </>
  );
};

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default AssignmentHeader;
