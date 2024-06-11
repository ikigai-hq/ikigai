import React from "react";

import {
  GetRubrics_userGetMyRubrics as IRubric,
  SpaceActionPermission,
} from "graphql/types";
import Rubric from "./index";
import usePermission from "hook/UsePermission";
import Modal from "../base/Modal";

export type EditRubricProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rubric: IRubric;
  children: React.ReactNode;
};

const ViewOrEditRubric = ({
  open,
  onOpenChange,
  rubric,
  children,
}: EditRubricProps) => {
  const allow = usePermission();
  const canEditRubric = allow(SpaceActionPermission.MANAGE_SPACE_CONTENT);
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      content={
        <Rubric
          rubric={rubric}
          afterSave={() => onOpenChange(false)}
          readOnly={!canEditRubric}
        />
      }
      minWidth="80vw"
    >
      {children}
    </Modal>
  );
};

export default ViewOrEditRubric;
