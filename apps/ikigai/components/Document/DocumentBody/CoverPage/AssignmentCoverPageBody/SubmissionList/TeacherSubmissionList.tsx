import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { t, Trans } from "@lingui/macro";
import { ColumnsType } from "antd/es/table";
import { Table, Tooltip, Typography } from "antd";
import { cloneDeep } from "lodash";

import { GetSubmissionsOfAssignment, Role } from "graphql/types";
import useDocumentStore, { ISubmission } from "store/DocumentStore";
import { GET_SUBMISSIONS_OF_ASSIGNMENT } from "graphql/query/AssignmentQuery";
import { handleError } from "graphql/ApolloClient";
import { ISpaceMember, useGetSpaceMembers } from "store/SpaceMembeStore";
import useSpaceStore from "store/SpaceStore";
import UserBasicInformation from "components/UserBasicInformation";
import { formatDocumentRoute } from "config/Routes";
import { TextButtonWithHover } from "components/common/Button";
import { IconListDetails, IconPencilCheck } from "@tabler/icons-react";
import SubmissionListOfStudent from "./SubmissionListOfStudent";
import { useState } from "react";

enum SubmissionStatus {
  NotSubmitted = "Not Submitted",
  InDoing = "In Doing",
  Submitted = "Submitted",
  Reviewed = "Feedback & Reviewed",
}

const TeacherSubmissionList = () => {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<
    ISpaceMember | undefined
  >(undefined);
  const spaceId = useSpaceStore((state) => state.spaceId);
  const assignmentId = useDocumentStore(
    (state) => state.activeDocument?.assignment?.id,
  );
  const { data } = useQuery<GetSubmissionsOfAssignment>(
    GET_SUBMISSIONS_OF_ASSIGNMENT,
    {
      onError: handleError,
      variables: {
        assignmentId,
      },
      fetchPolicy: "network-only",
    },
  );
  const { members } = useGetSpaceMembers(spaceId, Role.STUDENT);

  const submissions: Record<number, ISubmission[]> = {};
  (cloneDeep(data?.assignmentGetSubmissions) || [])
    .sort((a, b) => b.attemptNumber - a.attemptNumber)
    .forEach((submission) => {
      const innerSubmissions = submissions[submission.userId];
      if (innerSubmissions) {
        innerSubmissions.push(submission);
      } else {
        submissions[submission.userId] = [submission];
      }
    });

  const getSubmissions = (userId: number) => {
    return submissions[userId] || [];
  };

  const getSubmissionStatus = (userId: number): SubmissionStatus => {
    const submissions = getSubmissions(userId);
    if (submissions.length === 0) return SubmissionStatus.NotSubmitted;
    const lastSubmission = submissions[0];
    if (lastSubmission.feedbackAt) return SubmissionStatus.Reviewed;
    if (lastSubmission.submitAt) return SubmissionStatus.Submitted;
    return SubmissionStatus.InDoing;
  };

  const columns: ColumnsType<ISpaceMember> = [
    {
      key: "student",
      title: t`Student`,
      dataIndex: "student",
      render: (_, item) => {
        return (
          <UserBasicInformation
            name={item.user.name}
            avatar={item.user.avatar?.publicUrl}
            email={item.user.email}
            randomColor={item.user.randomColor}
          />
        );
      },
    },
    {
      key: "status",
      title: t`Status`,
      dataIndex: "status",
      render: (_, member) => {
        const status = getSubmissionStatus(member.userId);
        return <Typography.Text>{status}</Typography.Text>;
      },
    },
    {
      key: "Attempt",
      title: t`Attempt`,
      dataIndex: "attempt",
      render: (_, member) => {
        const submissions = getSubmissions(member.userId);
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography.Text>
              {submissions.length} <Trans>times</Trans>
            </Typography.Text>
            <Tooltip
              title={t`View all submissions of ${member.user.name}`}
              arrow={false}
              placement="bottom"
            >
              <TextButtonWithHover
                onClick={() => setSelectedMember(member)}
                type="text"
                icon={<IconListDetails size={18} />}
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      key: "Actions",
      dataIndex: "actions",
      width: 50,
      render: (_, member) => {
        const submissions = getSubmissions(member.userId);
        const lastSubmission = submissions[0];
        return (
          <div>
            {lastSubmission && (
              <Tooltip
                placement="bottom"
                title={t`Review and feedback last submission`}
                arrow={false}
              >
                <TextButtonWithHover
                  type="text"
                  onClick={() => {
                    router.push(formatDocumentRoute(lastSubmission.documentId));
                  }}
                  icon={<IconPencilCheck />}
                >
                  Feedback
                </TextButtonWithHover>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table rowKey={"userId"} columns={columns} dataSource={members} />
      {selectedMember && (
        <SubmissionListOfStudent
          open={!!selectedMember}
          onClose={() => setSelectedMember(undefined)}
          submissions={getSubmissions(selectedMember.userId)}
          member={selectedMember}
        />
      )}
    </div>
  );
};

export default TeacherSubmissionList;
