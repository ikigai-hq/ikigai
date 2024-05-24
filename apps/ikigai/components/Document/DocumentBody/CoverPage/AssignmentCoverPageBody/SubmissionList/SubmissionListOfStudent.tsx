import { Drawer, Typography } from "antd";
import { Trans } from "@lingui/macro";

import useDocumentStore, { ISubmission } from "store/DocumentStore";
import { ISpaceMember } from "store/SpaceMembeStore";
import UserBasicInformation from "components/UserBasicInformation";
import SubmissionsTableOfStudent from "./SubmissionsTableOfStudent";

export type SubmissionListOfStudentProps = {
  open: boolean;
  onClose: () => void;
  submissions: ISubmission[];
  member: ISpaceMember;
};

const SubmissionListOfStudent = ({
  open,
  onClose,
  submissions,
  member,
}: SubmissionListOfStudentProps) => {
  const title = useDocumentStore((state) => state.activeDocument?.title);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <UserBasicInformation
          name={member.user.name}
          email={member.user.email}
          randomColor={member.user.randomColor}
          avatar={member.user.avatar?.publicUrl}
        />
      }
      width={"60vw"}
    >
      <div>
        <Typography.Text strong type="secondary">
          <Trans>Submissions of {title}</Trans>
        </Typography.Text>
        <div>
          <SubmissionsTableOfStudent submissions={submissions} />
        </div>
      </div>
    </Drawer>
  );
};

export default SubmissionListOfStudent;
