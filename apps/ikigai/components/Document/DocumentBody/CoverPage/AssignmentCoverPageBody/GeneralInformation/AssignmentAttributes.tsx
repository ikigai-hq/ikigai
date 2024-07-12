import { DataList } from "@radix-ui/themes";

import TestDurationAttribute from "./TestDurationAttribute";
import { DocumentActionPermission, UpdateAssignmentData } from "graphql/types";
import AttemptAttribute from "./AttemptAttribute";
import GradeMethodAttribute from "./GradeMethodAttribute";
import RubricAttribute from "./RubricAttribute";
import AssigneesAttribute from "./AssigneesAttribute";
import usePermission from "hook/UsePermission";

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
        <DataList.Label minWidth="88px">Grade by Rubric</DataList.Label>
        <DataList.Value>
          <RubricAttribute
            rubricId={data.gradeByRubricId}
            onChangeRubricId={(rubricId) => {
              onChangeInnerAssignment({ gradeByRubricId: rubricId });
            }}
            readOnly={!canEdit}
          />
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
