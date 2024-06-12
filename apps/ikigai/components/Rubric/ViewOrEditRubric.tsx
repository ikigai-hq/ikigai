import React from "react";

import {
  GetRubrics_userGetMyRubrics as IRubric,
  SpaceActionPermission,
} from "graphql/types";
import Rubric from "./index";
import usePermission from "hook/UsePermission";

export type EditRubricProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rubric: IRubric;
};

const ViewOrEditRubric = ({ open, onOpenChange, rubric }: EditRubricProps) => {
  const allow = usePermission();
  const canEditRubric = allow(SpaceActionPermission.MANAGE_SPACE_CONTENT);
  return (
    <Rubric
      open={open}
      onOpenChange={onOpenChange}
      rubric={rubric}
      afterSave={() => onOpenChange(false)}
      readOnly={!canEditRubric}
    />
  );
};

export default ViewOrEditRubric;
