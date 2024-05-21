import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import TeacherGradeInformation from "./TeacherGradeInformation";

const GradeInformation = () => {
  const allow = usePermission();
  const caneEdit = allow(DocumentActionPermission.EDIT_DOCUMENT);

  if (caneEdit) return <TeacherGradeInformation />;
  return <div>Hello</div>;
};

export default GradeInformation;
