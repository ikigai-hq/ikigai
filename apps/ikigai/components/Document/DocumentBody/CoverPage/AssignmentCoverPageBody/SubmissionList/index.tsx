import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import StudentSubmissionList from "./StudentSubmissionList";
import TeacherSubmissionList from "./TeacherSubmissionList";

const SubmissionList = () => {
  const allow = usePermission();
  const canEdit = allow(DocumentActionPermission.EDIT_DOCUMENT);

  if (canEdit) return <TeacherSubmissionList />;
  return <StudentSubmissionList />;
};

export default SubmissionList;
