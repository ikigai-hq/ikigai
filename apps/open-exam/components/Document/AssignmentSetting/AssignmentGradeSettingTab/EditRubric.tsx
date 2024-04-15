import { GetRubrics_orgGetRubrics as IRubric } from "graphql/types";
import { Drawer } from "components/common/Drawer";
import Rubric from "./Rubric";
import useUserPermission from "hook/UseUserPermission";
import { Permission } from "util/permission";

export type EditRubricProps = {
  visible: boolean;
  onClose: () => void;
  rubric: IRubric;
};

const EditRubric = ({ visible, onClose, rubric }: EditRubricProps) => {
  const allow = useUserPermission();
  const canEditRubric = allow(Permission.ManageSpaceSetting);
  return (
    <Drawer
      open={visible}
      onClose={onClose}
      width="90vw"
    >
      <Rubric
        rubric={rubric}
        afterSave={onClose}
        readOnly={!canEditRubric}
      />
    </Drawer>
  );
};

export default EditRubric;
