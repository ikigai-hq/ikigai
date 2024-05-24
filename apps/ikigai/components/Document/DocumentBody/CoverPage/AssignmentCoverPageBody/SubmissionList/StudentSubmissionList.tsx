import { useQuery } from "@apollo/client";

import { GET_SUBMISSIONS_OF_ASSIGNMENT } from "graphql/query/AssignmentQuery";
import { handleError } from "graphql/ApolloClient";
import { GetSubmissionsOfAssignment } from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import SubmissionsTableOfStudent from "./SubmissionsTableOfStudent";

const StudentSubmissionList = () => {
  const assignmentId = useDocumentStore(
    (state) => state.activeDocument?.assignment?.id,
  );
  const { data } = useQuery<GetSubmissionsOfAssignment>(
    GET_SUBMISSIONS_OF_ASSIGNMENT,
    {
      onError: handleError,
      variables: {
        assignmentId,
      },
      fetchPolicy: "network-only",
    },
  );

  const mySubmissions = data?.assignmentGetSubmissions || [];

  return <SubmissionsTableOfStudent submissions={mySubmissions} />;
};

export default StudentSubmissionList;
