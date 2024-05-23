import { Button } from "antd";
import { t, Trans } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { STUDENT_START_SUBMISSION } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import { StartSubmission } from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import { formatDocumentRoute } from "config/Routes";

const StudentExtraActions = () => {
  const router = useRouter();
  const assignmentId = useDocumentStore(
    (state) => state.activeDocument?.assignment?.id,
  );
  const [startSubmission, { loading }] = useMutation<StartSubmission>(
    STUDENT_START_SUBMISSION,
    {
      onError: handleError,
    },
  );

  const onStartSubmission = async () => {
    const { data } = await toast.promise(
      startSubmission({
        variables: {
          assignmentId,
        },
      }),
      {
        loading: t`Please wait us a little bit! We're creating your submission space...`,
        success: t`Moved to submission space!`,
        error: t`Cannot create submission`,
      },
    );

    if (data) {
      router.push(
        formatDocumentRoute(data.assignmentStartSubmission.documentId),
      );
    }
  };

  return (
    <div>
      <Button
        onClick={onStartSubmission}
        type="primary"
        size="large"
        loading={loading}
        disabled={loading}
      >
        <Trans>New Attempt</Trans>
      </Button>
    </div>
  );
};

export default StudentExtraActions;
