import { ColumnsType } from "antd/es/table";
import { t, Trans } from "@lingui/macro";
import { Button, Table, Typography } from "antd";
import { useRouter } from "next/router";

import { formatDocumentRoute } from "config/Routes";
import { formatTimestamp, FormatType } from "util/Time";
import { GetSubmissionsOfAssignment_assignmentGetSubmissions as ISubmission } from "graphql/types";

export type SubmissionsTableOfStudentProps = {
  submissions: ISubmission[];
};

const SubmissionsTableOfStudent = ({
  submissions,
}: SubmissionsTableOfStudentProps) => {
  const router = useRouter();
  const columns: ColumnsType<ISubmission> = [
    {
      key: "startAt",
      title: t`Start at`,
      dataIndex: "startAt",
      render: (startAt) => {
        return (
          <Typography.Text>
            {formatTimestamp(startAt, FormatType.DateTimeFormat)}
          </Typography.Text>
        );
      },
    },
    {
      key: "submitAt",
      title: t`Submit at`,
      dataIndex: "submitAt",
      render: (submitAt) => {
        if (submitAt) {
          return (
            <Typography.Text>
              {formatTimestamp(submitAt, FormatType.DateTimeFormat)}
            </Typography.Text>
          );
        }
        return (
          <Typography.Text type="secondary">
            <Trans>Not submitted</Trans>
          </Typography.Text>
        );
      },
    },
    {
      key: "Grade",
      title: t`Grade`,
      dataIndex: "finalGrade",
      render: (finalGrade) => {
        if (finalGrade !== null) {
          return <Typography.Text strong>{finalGrade}</Typography.Text>;
        }

        return (
          <Typography.Text type="secondary">
            <Trans>No Grade</Trans>
          </Typography.Text>
        );
      },
    },
    {
      key: "Actions",
      dataIndex: "Actions",
      render: (_, submission) => {
        return (
          <div>
            <Button
              onClick={() => {
                router.push(formatDocumentRoute(submission.documentId));
              }}
            >
              <Trans>View</Trans>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table rowKey="id" dataSource={submissions} columns={columns} />
    </div>
  );
};

export default SubmissionsTableOfStudent;
