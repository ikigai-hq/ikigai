import { DataList, Text } from "@radix-ui/themes";
import { Trans, t } from "@lingui/macro";

import TestDurationAttribute from "./TestDurationAttribute";
import { DocumentActionPermission, UpdateAssignmentData } from "graphql/types";
import AttemptAttribute from "./AttemptAttribute";
import GradeMethodAttribute from "./GradeMethodAttribute";
import AssigneesAttribute from "./AssigneesAttribute";
import usePermission from "hook/UsePermission";
import { useOrderedQuizzes } from "hook/UseQuiz";

export type AssignmentAttributesProps = {
  data: UpdateAssignmentData;
  onChange: (data: UpdateAssignmentData) => void;
  canEdit: boolean;
};

const AssignmentAttributes = ({
  data,
  onChange,
  canEdit,
}: AssignmentAttributesProps) => {
  const allow = usePermission();
  const { orderedQuizzes, orderedPages } = useOrderedQuizzes();
  const onChangeInnerAssignment = (
    updateData: Partial<UpdateAssignmentData>,
  ) => {
    onChange({
      ...data,
      ...updateData,
    });
  };

  return (
    <DataList.Root>
      <DataList.Item align="center">
        <DataList.Label minWidth="88px">Test Duration</DataList.Label>
        <DataList.Value>
          <TestDurationAttribute
            testDuration={data.testDuration}
            onChangeTestDuration={(testDuration) =>
              onChangeInnerAssignment({ testDuration })
            }
            readOnly={!canEdit}
          />
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label minWidth="88px">Attempts</DataList.Label>
        <DataList.Value>
          <AttemptAttribute
            attemptNumber={data.maxNumberOfAttempt}
            onChangeAttemptNumber={(attemptNumber) =>
              onChangeInnerAssignment({ maxNumberOfAttempt: attemptNumber })
            }
            readOnly={!canEdit}
          />
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label minWidth="88px">Grade Method</DataList.Label>
        <DataList.Value>
          <GradeMethodAttribute
            gradeMethod={data.gradeMethod}
            onChangeGradeMethod={(gradeMethod) =>
              onChangeInnerAssignment({ gradeMethod })
            }
            readOnly={!canEdit}
          />
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label minWidth="88px">
          <Trans>Quizzes</Trans>
        </DataList.Label>
        <DataList.Value>
          <Text align="center">
            {orderedQuizzes.length}{" "}
            {orderedQuizzes.length > 1 ? t`quizzes` : t`quiz`}
            <Text size="1" color="gray">
              ({orderedPages.length}{" "}
              {orderedPages.length > 1 ? t`pages` : t`page`})
            </Text>
          </Text>
        </DataList.Value>
      </DataList.Item>
      {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
        <DataList.Item>
          <DataList.Label minWidth="88px">Assign</DataList.Label>
          <DataList.Value>
            <AssigneesAttribute />
          </DataList.Value>
        </DataList.Item>
      )}
    </DataList.Root>
  );
};

export default AssignmentAttributes;
