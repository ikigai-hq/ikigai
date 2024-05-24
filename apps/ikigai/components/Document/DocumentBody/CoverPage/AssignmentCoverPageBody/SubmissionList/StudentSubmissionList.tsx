import useDocumentStore from "store/DocumentStore";
import SubmissionsTableOfStudent from "./SubmissionsTableOfStudent";

const StudentSubmissionList = () => {
  const submissions = useDocumentStore((state) => state.submissions);
  return <SubmissionsTableOfStudent submissions={submissions} />;
};

export default StudentSubmissionList;
