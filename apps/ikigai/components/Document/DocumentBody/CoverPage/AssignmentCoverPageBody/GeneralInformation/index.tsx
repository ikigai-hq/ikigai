import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import TeacherGeneralInformation from "./TeacherGeneralInformation";
import StudentGeneralInformation from "./StudentGeneralInformation";

const GeneralInformation = () => {
  const allow = usePermission();
  const caneEdit = allow(DocumentActionPermission.EDIT_DOCUMENT);

  if (caneEdit) return <TeacherGeneralInformation />;

  return <StudentGeneralInformation />;
};

export default GeneralInformation;
