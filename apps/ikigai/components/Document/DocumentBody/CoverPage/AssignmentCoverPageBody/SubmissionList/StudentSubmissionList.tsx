import { useQuery } from "@apollo/client";
import { Table, Tooltip, Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import { ColumnsType } from "antd/es/table";
import { IconEye } from "@tabler/icons-react";
import { useRouter } from "next/router";

import { GET_SUBMISSIONS_OF_ASSIGNMENT } from "graphql/query/AssignmentQuery";
import { handleError } from "graphql/ApolloClient";
import {
  GetSubmissionsOfAssignment,
  GetSubmissionsOfAssignment_documentGet_assignment_submissions as IMySubmission,
} from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import { formatTimestamp, FormatType } from "util/Time";
import { TextButtonWithHover } from "components/common/Button";
import { formatDocumentRoute } from "config/Routes";

const StudentSubmissionList = () => {
  const router = useRouter();
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const { data } = useQuery<GetSubmissionsOfAssignment>(
    GET_SUBMISSIONS_OF_ASSIGNMENT,
    {
      onError: handleError,
      variables: {
        assignmentDocumentId: activeDocumentId,
      },
      fetchPolicy: "network-only",
    },
  );

  const mySubmissions = data?.documentGet?.assignment?.submissions || [];
  const columns: ColumnsType<IMySubmission> = [
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
            <Tooltip
              arrow={false}
              title={t`View submission`}
              placement="bottom"
            >
              <TextButtonWithHover
                type="text"
                icon={<IconEye stroke={1.5} />}
                onClick={() => {
                  router.push(formatDocumentRoute(submission.documentId));
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table dataSource={mySubmissions} columns={columns} />
    </div>
  );
};

export default StudentSubmissionList;
