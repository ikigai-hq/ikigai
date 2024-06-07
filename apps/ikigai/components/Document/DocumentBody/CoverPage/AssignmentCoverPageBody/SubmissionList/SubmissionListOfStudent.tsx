import { t } from "@lingui/macro";
import React from "react";

import useDocumentStore, { ISubmission } from "store/DocumentStore";
import { ISpaceMember } from "store/SpaceMembeStore";
import SubmissionsTableOfStudent from "./SubmissionsTableOfStudent";
import Modal from "components/base/Modal";

export type SubmissionListOfStudentProps = {
  open: boolean;
  onClose: () => void;
  submissions: ISubmission[];
  member: ISpaceMember;
  children: React.ReactNode;
};

const SubmissionListOfStudent = ({
  open,
  onClose,
  submissions,
  children,
}: SubmissionListOfStudentProps) => {
  const title = useDocumentStore((state) => state.activeDocument?.title);
  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title={t`Submissions of ${title}`}
      content={<SubmissionsTableOfStudent submissions={submissions} />}
      minWidth="60vw"
    >
      {children}
    </Modal>
  );
};

export default SubmissionListOfStudent;
