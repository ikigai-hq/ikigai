import { t } from "@lingui/macro";
import { useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";
import { Tooltip } from "@radix-ui/themes";

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
import IkigaiPopover from "components/base/Popover";

const HeaderSubmissionUserInfo = () => {
  const allow = usePermission();
  const submission = useDocumentStore(
    (state) => state.activeDocument?.submission,
  );

  const canManageContent = allow(SpaceActionPermission.MANAGE_SPACE_CONTENT);
  if (!canManageContent) {
    return (
      <UserBasicInformation
        name={submission?.user?.name}
        avatar={submission?.user?.avatar?.publicUrl}
        randomColor={submission?.user?.randomColor}
      />
    );
  }

  return (
    <>
      <Tooltip content={t`View other students`}>
        <IkigaiPopover
          content={
            <OtherStudentSubmissions
              currentSubmissionUserId={submission?.user?.id}
            />
          }
          width={"100vw"}
        >
          <div>
            <UserBasicInformation
              name={submission?.user?.name}
              avatar={submission?.user?.avatar?.publicUrl}
              randomColor={submission?.user?.randomColor}
            />
          </div>
        </IkigaiPopover>
      </Tooltip>
    </>
  );
};

type OtherStudentSubmissionsProps = {
  currentSubmissionUserId: number;
};

const OtherStudentSubmissions = ({
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
    <div>
      <TeacherSubmissionListTable
        submissions={submissions}
        skipUserIds={[currentSubmissionUserId]}
      />
    </div>
  );
};

export default HeaderSubmissionUserInfo;
