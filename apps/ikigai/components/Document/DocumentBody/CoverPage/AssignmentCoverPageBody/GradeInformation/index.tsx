import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import TeacherGradeInformation from "./TeacherGradeInformation";
import StudentGradeInformation from "./StudentGradeInformation";

const GradeInformation = () => {
  const allow = usePermission();
  const caneEdit = allow(DocumentActionPermission.EDIT_DOCUMENT);

  if (caneEdit) return <TeacherGradeInformation />;
  return <StudentGradeInformation />;
};

export default GradeInformation;
