import {
  GetRubrics_userGetMyRubrics as IRubric,
  SpaceActionPermission,
} from "graphql/types";
import { Drawer } from "components/common/Drawer";
import Rubric from "./index";
import usePermission from "hook/UsePermission";

export type EditRubricProps = {
  visible: boolean;
  onClose: () => void;
  rubric: IRubric;
};

const ViewOrEditRubric = ({ visible, onClose, rubric }: EditRubricProps) => {
  const allow = usePermission();
  const canEditRubric = allow(SpaceActionPermission.MANAGE_SPACE_CONTENT);
  return (
    <Drawer open={visible} onClose={onClose} width="90vw">
      <Rubric rubric={rubric} afterSave={onClose} readOnly={!canEditRubric} />
    </Drawer>
  );
};

export default ViewOrEditRubric;
