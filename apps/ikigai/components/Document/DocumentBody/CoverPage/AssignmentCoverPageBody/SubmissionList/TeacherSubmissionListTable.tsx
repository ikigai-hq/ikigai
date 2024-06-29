import { t, Trans } from "@lingui/macro";
import { useState } from "react";
import { useRouter } from "next/router";
import { IconButton, Table, Text, Tooltip } from "@radix-ui/themes";
import { Pencil1Icon, RowsIcon } from "@radix-ui/react-icons";

import { formatDocumentRoute } from "config/Routes";
import SubmissionListOfStudent from "./SubmissionListOfStudent";
import { ISpaceMember, useGetSpaceMembers } from "store/SpaceMembeStore";
import UserBasicInformation from "components/UserBasicInformation";
import { StudentStatus, SubmissionStatus } from "util/DocumentUtil";
import { ISubmission } from "store/DocumentStore";
import { Role } from "graphql/types";
import { formatTimestamp, FormatType } from "util/Time";

export type TeacherSubmissionListTableProps = {
  submissions: ISubmission[];
  skipUserIds?: number[];
};

const TeacherSubmissionListTable = ({
  submissions: innerSubmissions,
  skipUserIds,
}: TeacherSubmissionListTableProps) => {
  const [selectedMember, setSelectedMember] = useState<
    ISpaceMember | undefined
  >(undefined);
  const { members } = useGetSpaceMembers(Role.STUDENT, skipUserIds);

  const submissions: Record<number, ISubmission[]> = {};
  innerSubmissions
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

  const lastSubmission = (userId: number) => {
    return getSubmissions(userId)[0];
  };

  const getSubmissionStatus = (userId: number): SubmissionStatus => {
    const submissions = getSubmissions(userId);
    if (submissions.length === 0) return SubmissionStatus.NotSubmitted;
    const lastSubmission = submissions[0];
    if (lastSubmission.feedbackAt) return SubmissionStatus.Graded;
    if (lastSubmission.submitAt) return SubmissionStatus.Submitted;
    return SubmissionStatus.InDoing;
  };

  const rowRender = (member: ISpaceMember) => {
    const submission = lastSubmission(member.userId);
    return (
      <Table.Row key={member.userId} align="center">
        <Table.RowHeaderCell>
          <UserBasicInformation
            name={member.user.name}
            avatar={member.user.avatar?.publicUrl}
            email={member.user.email}
            randomColor={member.user.randomColor}
          />
        </Table.RowHeaderCell>
        <Table.Cell>
          {submission?.startAt
            ? formatTimestamp(submission.startAt, FormatType.DateTimeFormat)
            : ""}
        </Table.Cell>
        <Table.Cell>
          {submission?.submitAt
            ? formatTimestamp(submission.submitAt, FormatType.DateTimeFormat)
            : ""}
        </Table.Cell>
        <Table.Cell>
          {submission?.feedbackAt
            ? formatTimestamp(submission.feedbackAt, FormatType.DateTimeFormat)
            : ""}
        </Table.Cell>
        <Table.Cell>
          <StudentStatus status={getSubmissionStatus(member.userId)} />
        </Table.Cell>
        <Table.Cell>
          <Text>{getSubmissions(member.userId)[0]?.finalGrade}</Text>
        </Table.Cell>
        <Table.Cell>
          <StudentSubmissionStatus
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            submissions={getSubmissions(member.userId)}
            member={member}
          />
        </Table.Cell>
        <Table.Cell>
          <Actions lastSubmission={getSubmissions(member.userId)[0]} />
        </Table.Cell>
      </Table.Row>
    );
  };

  return (
    <div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              <Trans>Name</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Start at</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Submit at</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Feedback at</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Status</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Grade</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Attempt</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>{members.map(rowRender)}</Table.Body>
      </Table.Root>
    </div>
  );
};

const StudentSubmissionStatus = ({
  submissions,
  member,
  selectedMember,
  setSelectedMember,
}: {
  submissions: ISubmission[];
  member: ISpaceMember;
  selectedMember?: ISpaceMember;
  setSelectedMember: (member: ISpaceMember) => void;
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Text>
        {submissions.length} <Trans>times</Trans>
      </Text>
      {submissions.length > 0 && (
        <SubmissionListOfStudent
          open={!!selectedMember}
          onClose={() => setSelectedMember(undefined)}
          submissions={submissions}
          member={selectedMember}
        >
          <Tooltip content={t`View all submissions of ${member.user.name}`}>
            <IconButton
              size="1"
              color="gray"
              variant="ghost"
              onClick={() => setSelectedMember(member)}
              style={{ marginLeft: 10 }}
            >
              <RowsIcon />
            </IconButton>
          </Tooltip>
        </SubmissionListOfStudent>
      )}
    </div>
  );
};

const Actions = ({ lastSubmission }: { lastSubmission?: ISubmission }) => {
  const router = useRouter();
  return (
    <div>
      {lastSubmission && (
        <Tooltip content={t`Review and feedback last submission`}>
          <IconButton
            size="1"
            onClick={() => {
              router.push(formatDocumentRoute(lastSubmission.documentId));
            }}
          >
            <Pencil1Icon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default TeacherSubmissionListTable;
