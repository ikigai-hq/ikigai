import { Typography } from "antd";
import { Trans, t } from "@lingui/macro";
import { useRouter } from "next/router";

import Table from "../common/Table";
import AvatarWithName from "../AvatarWithName";
import Tag from "../common/Tag";
import { Text } from "../common/Text";
import { TextButtonWithHover } from "../common/Button";
import Modal from "../common/Modal";
import { formatDate, FormatType } from "util/Time";
import {
  GetDocumentDetail_documentGet_assignment_submissions as ISubmission,
  GetClassMembers_classGet_members as IMember,
  OrgRole,
} from "graphql/types";
import { formatDocumentRoute } from "config/Routes";
import useDocumentStore from "context/ZustandDocumentStore";
import { useTheme } from "styled-components";

enum SubmissionStatus {
  NotSubmitted,
  Graded,
  Submitted,
  InDoing,
}

const SubmissionStatusFilterList = [
  SubmissionStatus.NotSubmitted,
  SubmissionStatus.Graded,
  SubmissionStatus.Submitted,
  SubmissionStatus.InDoing,
];

const formatStudentStatus = (status: SubmissionStatus) => {
  if (status === SubmissionStatus.Submitted) return t`Submitted`;
  if (status === SubmissionStatus.NotSubmitted) return t`Not Submitted`;
  if (status === SubmissionStatus.Graded) return t`Graded`;
  return t`In Doing`;
};

const getSubmissionStatus = (submission?: ISubmission): SubmissionStatus => {
  if (!submission) return SubmissionStatus.NotSubmitted;
  if (submission.feedbackAt) return SubmissionStatus.Graded;
  if (submission.submitAt) return SubmissionStatus.Submitted;
  return SubmissionStatus.InDoing;
};

const getSubmissionColor = (status: SubmissionStatus) => {
  if (status === SubmissionStatus.Submitted) return "polarGreen";
  if (status === SubmissionStatus.InDoing) return "dustRed";
  if (status === SubmissionStatus.Graded) return "dayBreakBlue";
};

export type AssignmentListProps = {
  submissions: ISubmission[];
  members: IMember[];
  scroll?: {
    x: number;
    y: number;
  };
};

export const AssignmentList = ({
  submissions,
  members,
  scroll,
}: AssignmentListProps) => {
  const { push } = useRouter();
  const theme = useTheme();

  const startByTeacher = useDocumentStore((state) => state.startSubmissionByTeacher);

  const onSelectGradeStudent = async (student: IMember, submission?: ISubmission) => {
    if (submission?.documentId) {
      push(formatDocumentRoute(submission.documentId));
    } else {
      const data = await startByTeacher(student.user.id);
      if (data) {
        push(formatDocumentRoute(data.documentId));
      }
    }
  };

  const students = members
    .filter((member) => member.user.orgMember?.orgRole === OrgRole.STUDENT);
  const getSubmission = (userId: number): ISubmission | undefined => {
    return submissions.find((submission) => submission.userId === userId);
  };

  const onClickStudent = (student: IMember) => {
    const submission = getSubmission(student.user.id);
    onSelectGradeStudent(student, submission);
  };

  const columns: any[] = [
    {
      title: t`Student`,
      dataIndex: "student",
      key: "student",
      width: 150,
      render: (_, student: IMember) => (
        <div onClick={() => onClickStudent(student)} style={{ cursor: "pointer" }}>
          <AvatarWithName
            name={student.user.orgPersonalInformation?.fullName}
            avtUrl={student.user.orgPersonalInformation?.avatar?.publicUrl}
            color={student.user.randomColor}
          />
        </div>
      ),
    },
    {
      title: t`Submit at`,
      dataIndex: "submitAt",
      key: "submitAt",
      width: 100,
      render: (_, student: IMember) => {
        const submission = getSubmission(student.user.id);

        if (!submission || !submission.submitAt) return null;
        return <Text>{formatDate(submission.startAt, FormatType.DateTimeFormat)}</Text>;
      },
    },
    {
      title: t`Feedback at`,
      dataIndex: "feedbackAt",
      key: "feedbackAt",
      width: 100,
      render: (_, student: IMember) => {
        const submission = getSubmission(student.user.id);

        if (!submission || !submission.feedbackAt) return null;
        return <Text>{formatDate(submission.feedbackAt, FormatType.DateTimeFormat)}</Text>;
      },
    },
    {
      title: t`Status`,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_, student: IMember) => {
        const submission = getSubmission(student.user.id);
        const status = getSubmissionStatus(submission);
        return <Tag color={getSubmissionColor(status)}>{formatStudentStatus(status)}</Tag>;
      },
      filters: SubmissionStatusFilterList.map((status) => {
        return {
          text: formatStudentStatus(status),
          value: status,
        };
      }),
      onFilter: (value: SubmissionStatus, student: IMember) => {
        const submission = getSubmission(student.user.id);
        const status = getSubmissionStatus(submission);
        return value === status;
      },
    },
    {
      title: t`Grade`,
      dataIndex: "finalGrade",
      key: "finalGrade",
      width: 80,
      render: (_, student: IMember) => {
        const submission = getSubmission(student.user.id);

        return <Text>{submission?.finalGrade === undefined ? "-" : submission.finalGrade}</Text>;
      },
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      width: 100,
      render: (_, student: IMember) => {
        const submission = getSubmission(student.user.id);

        return (
          <TextButtonWithHover type={"text"} onClick={() => onClickStudent(student)}>
            {submission && (
              <Text color={theme.colors.primary[5]}>
                <Trans>Review & Grade</Trans>
              </Text>
            )}
            {!submission && (
              <Text color={theme.colors.primary[5]}>
                <Trans>Grade</Trans>
              </Text>
            )}
          </TextButtonWithHover>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={students}
      columns={columns}
      rowKey={(student: IMember) => student.user.id}
      pagination={false}
      scroll={scroll}
    />
  );
};

export type AssignmentStudentListProps = {
  submissions: ISubmission[];
  members: IMember[];
  open: boolean;
  onClose: () => void;
};

const AssignmentStudentListModal = ({
  open,
  onClose,
  members,
  submissions,
}: AssignmentStudentListProps) => {
  return (
    <Modal visible={open} onClose={onClose} width={"74vw"}>
      <div>
        <Typography.Title level={5}>
          <Trans>Submission List</Trans>
        </Typography.Title>
        <div style={{ width: "68vw" }}>
          <AssignmentList
            submissions={submissions}
            members={members}
            scroll={{ x: 700, y: 500 }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AssignmentStudentListModal;
