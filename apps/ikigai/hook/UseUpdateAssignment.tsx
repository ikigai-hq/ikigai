import { useMutation } from "@apollo/client";

import { UPDATE_ASSIGNMENT } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import { UpdateAssignmentData } from "graphql/types";
import useDocumentStore, {
  wrapAsyncDocumentSavingFn,
} from "store/DocumentStore";

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
    const { data: resData } = await wrapAsyncDocumentSavingFn(
      updateAssignmentServer,
    )({
      variables: {
        assignmentId: assignment.id,
        data,
      },
    });
    if (resData) {
      updateAssignmentInStore(data);
    }
  };

  return {
    updateAssignment,
    res,
  };
};

export default useUpdateAssignment;
