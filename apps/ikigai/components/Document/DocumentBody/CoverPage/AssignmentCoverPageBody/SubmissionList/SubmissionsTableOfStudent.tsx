import { Trans } from "@lingui/macro";
import { Table, Text, Button } from "@radix-ui/themes";
import { useRouter } from "next/router";

import { formatDocumentRoute } from "config/Routes";
import { formatTimestamp, FormatType } from "util/Time";
import { GetSubmissionsOfAssignment_assignmentGetSubmissions as ISubmission } from "graphql/types";
import { getSubmissionStatus, StudentStatus } from "util/DocumentUtil";

export type SubmissionsTableOfStudentProps = {
  submissions: ISubmission[];
};

const SubmissionsTableOfStudent = ({
  submissions,
}: SubmissionsTableOfStudentProps) => {
  const router = useRouter();
  return (
    <div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
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
            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {submissions.map((submission) => (
            <Table.Row key={submission.id} align="center">
              <Table.RowHeaderCell>
                {formatTimestamp(submission.startAt, FormatType.DateTimeFormat)}
              </Table.RowHeaderCell>
              <Table.Cell>
                {submission.submitAt &&
                  formatTimestamp(
                    submission.submitAt,
                    FormatType.DateTimeFormat,
                  )}
                {!submission.submitAt && (
                  <Text>
                    <Trans>Not submitted</Trans>
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell>
                {submission.feedbackAt &&
                  formatTimestamp(
                    submission.feedbackAt,
                    FormatType.DateTimeFormat,
                  )}
                {!submission.feedbackAt && (
                  <Text>
                    <Trans>No feedback</Trans>
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell>
                <StudentStatus status={getSubmissionStatus(submission)} />
              </Table.Cell>
              <Table.Cell>
                {submission.feedbackAt && submission.finalGrade !== null && (
                  <Text>{submission.finalGrade}</Text>
                )}
                {!submission.feedbackAt && (
                  <Text>
                    <Trans>No grade</Trans>
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell>
                <div>
                  <Button
                    size="1"
                    onClick={() => {
                      router.push(formatDocumentRoute(submission.documentId));
                    }}
                  >
                    <Trans>View</Trans>
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default SubmissionsTableOfStudent;
