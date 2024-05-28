import { Drawer, Tooltip } from "antd";
import { t } from "@lingui/macro";
import { useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";

import {
  GetSubmissionsOfAssignment,
  SpaceActionPermission,
} from "graphql/types";
import UserBasicInformation from "components/UserBasicInformation";
import useDocumentStore from "store/DocumentStore";
import usePermission from "hook/UsePermission";
import { GET_SUBMISSIONS_OF_ASSIGNMENT } from "graphql/query/AssignmentQuery";
import { handleError } from "graphql/ApolloClient";
import TeacherSubmissionListTable from "../DocumentBody/CoverPage/AssignmentCoverPageBody/SubmissionList/TeacherSubmissionListTable";
import { useState } from "react";

const HeaderSubmissionUserInfo = () => {
  const [openSubmissionList, setOpenSubmissionList] = useState(false);
  const allow = usePermission();
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );

  const canManageContent = allow(SpaceActionPermission.MANAGE_SPACE_CONTENT);
  if (!canManageContent) {
    return (
      <UserBasicInformation
        size={"small"}
        name={submission?.user?.name}
        avatar={submission?.user?.avatar?.publicUrl}
        randomColor={submission?.user?.randomColor}
        onClick={() => setOpenSubmissionList(true)}
      />
    );
  }

  return (
    <>
      <Tooltip title={t`Click to view other students`} arrow={false}>
        <div>
          <UserBasicInformation
            size={"small"}
            name={submission?.user?.name}
            avatar={submission?.user?.avatar?.publicUrl}
            randomColor={submission?.user?.randomColor}
            onClick={() => setOpenSubmissionList(true)}
          />
        </div>
      </Tooltip>
      <OtherStudentSubmissions
        currentSubmissionUserId={submission?.user?.id}
        open={openSubmissionList}
        onClose={() => setOpenSubmissionList(false)}
      />
    </>
  );
};

type OtherStudentSubmissionsProps = {
  currentSubmissionUserId: number;
  open: boolean;
  onClose: () => void;
};

const OtherStudentSubmissions = ({
  open,
  onClose,
  currentSubmissionUserId,
}: OtherStudentSubmissionsProps) => {
  const assignmentId = useDocumentStore(
    (state) => state.activeDocument?.submission?.assignment?.id,
  );
  const { data } = useQuery<GetSubmissionsOfAssignment>(
    GET_SUBMISSIONS_OF_ASSIGNMENT,
    {
      onError: handleError,
      variables: {
        assignmentId,
      },
    },
  );

  const submissions = cloneDeep(data?.assignmentGetSubmissions) || [];
  return (
    <Drawer open={open} onClose={() => onClose()} width="70vw">
      <div>
        <TeacherSubmissionListTable
          submissions={submissions}
          skipUserIds={[currentSubmissionUserId]}
        />
      </div>
    </Drawer>
  );
};

export default HeaderSubmissionUserInfo;
