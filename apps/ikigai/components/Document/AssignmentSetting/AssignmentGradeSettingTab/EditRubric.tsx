import Rubric from "./Rubric";
import usePermission from "hook/UsePermission";
import { Drawer } from "components/common/Drawer";
import {
  GetRubrics_userGetMyRubrics as IRubric,
  SpaceActionPermission,
} from "graphql/types";

export type EditRubricProps = {
  visible: boolean;
  onClose: () => void;
  rubric: IRubric;
};

const EditRubric = ({ visible, onClose, rubric }: EditRubricProps) => {
  const allow = usePermission();
  const canEditRubric = allow(SpaceActionPermission.MANAGE_SPACE_SETTING);
  return (
    <Drawer open={visible} onClose={onClose} width="90vw">
      <Rubric rubric={rubric} afterSave={onClose} readOnly={!canEditRubric} />
    </Drawer>
  );
};

export default EditRubric;
