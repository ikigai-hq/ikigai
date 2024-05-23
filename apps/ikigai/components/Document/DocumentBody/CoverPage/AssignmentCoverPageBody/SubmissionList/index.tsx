import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import StudentSubmissionList from "./StudentSubmissionList";

const SubmissionList = () => {
  const allow = usePermission();
  const canEdit = allow(DocumentActionPermission.EDIT_DOCUMENT);

  if (canEdit) return <div>Hello</div>;
  return <StudentSubmissionList />;
};

export default SubmissionList;
