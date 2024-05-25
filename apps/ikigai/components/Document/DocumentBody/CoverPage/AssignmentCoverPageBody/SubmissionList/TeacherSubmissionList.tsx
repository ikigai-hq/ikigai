import useDocumentStore from "store/DocumentStore";
import TeacherSubmissionListTable from "./TeacherSubmissionListTable";

const TeacherSubmissionList = () => {
  const submissionsOfAssignment = useDocumentStore(
    (state) => state.submissions,
  );

  return <TeacherSubmissionListTable submissions={submissionsOfAssignment} />;
};

export default TeacherSubmissionList;
