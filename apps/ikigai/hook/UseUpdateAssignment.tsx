import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { t } from "@lingui/macro";

import { UPDATE_ASSIGNMENT } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import { UpdateAssignmentData } from "graphql/types";
import useDocumentStore from "store/DocumentStore";

const useUpdateAssignment = () => {
  const [updateAssignmentServer, res] = useMutation(UPDATE_ASSIGNMENT, {
    onError: handleError,
  });
  const assignment = useDocumentStore(
    (state) => state.activeDocument?.assignment,
  );
  const updateAssignmentInStore = useDocumentStore(
    (state) => state.updateActiveAssignment,
  );

  const updateAssignment = async (data: UpdateAssignmentData) => {
    if (!assignment) return;
    const { data: resData } = await updateAssignmentServer({
      variables: {
        assignmentId: assignment.id,
        data,
      },
    });
    if (resData) {
      updateAssignmentInStore(data);
      toast.success(t`Updated!`);
    }
  };

  return {
    updateAssignment,
    res,
  };
};

export default useUpdateAssignment;
