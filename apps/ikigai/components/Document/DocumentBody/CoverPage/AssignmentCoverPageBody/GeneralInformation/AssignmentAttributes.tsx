import { DataList, Select, Text } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import React from "react";

import TestDurationAttribute from "./TestDurationAttribute";
import {
  DocumentActionPermission,
  DocumentVisibility,
  UpdateAssignmentData,
} from "graphql/types";
import AttemptAttribute from "./AttemptAttribute";
import GradeMethodAttribute from "./GradeMethodAttribute";
import AssigneesAttribute from "./AssigneesAttribute";
import usePermission from "hook/UsePermission";
import { useOrderedQuizzes } from "hook/UseQuiz";
import useDocumentStore from "store/DocumentStore";
import useUpdateDocument from "../../../../../../hook/UseUpdateDocument";

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
  const { orderedQuizzes } = useOrderedQuizzes();
  const totalQuizAssignment = useDocumentStore(
    (state) => state.activeDocument?.assignment?.totalQuiz || 0,
  );
  const visibility = useDocumentStore(
    (state) => state.activeDocument?.visibility,
  );
  const updateDocument = useUpdateDocument();

  const onChangeInnerAssignment = (
    updateData: Partial<UpdateAssignmentData>,
  ) => {
    onChange({
      ...data,
      ...updateData,
    });
  };

  const onChangeVisibility = (visibility: DocumentVisibility) => {
    updateDocument({ visibility }, true);
  };

  const totalQuiz = allow(DocumentActionPermission.MANAGE_DOCUMENT)
    ? orderedQuizzes.length
    : totalQuizAssignment;

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
            {totalQuiz} {totalQuiz > 1 ? t`quizzes` : t`quiz`}
          </Text>
        </DataList.Value>
      </DataList.Item>
      {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
        <DataList.Item>
          <DataList.Label minWidth="88px">
            <Trans>Access visibility</Trans>
          </DataList.Label>
          <DataList.Value>
            <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
              <Select.Root
                value={visibility}
                onValueChange={onChangeVisibility}
                size="1"
              >
                <Select.Trigger
                  variant="soft"
                  style={{ width: "fit-content" }}
                />
                <Select.Content>
                  <Select.Group>
                    <Select.Item value={DocumentVisibility.PUBLIC}>
                      <Trans>Public</Trans>
                    </Select.Item>
                    <Select.Item value={DocumentVisibility.PRIVATE}>
                      <Trans>Private</Trans>
                    </Select.Item>
                    <Select.Item value={DocumentVisibility.ASSIGNEES}>
                      <Trans>Assignees only</Trans>
                    </Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select.Root>
              <div>
                {visibility === DocumentVisibility.PUBLIC && (
                  <Text color="gray">
                    <Trans>
                      All students of this space can access this assignment.
                    </Trans>
                  </Text>
                )}
                {visibility === DocumentVisibility.PRIVATE && (
                  <Text color="gray">
                    <Trans>
                      Only you and other teachers can access this assignment.
                    </Trans>
                  </Text>
                )}
                {visibility === DocumentVisibility.ASSIGNEES && (
                  <Text color="gray">
                    <Trans>
                      Only assignees (listed below) can access this assignment.
                    </Trans>
                  </Text>
                )}
              </div>
            </div>
          </DataList.Value>
        </DataList.Item>
      )}
      {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
        <DataList.Item>
          <DataList.Label minWidth="88px">
            <Trans>Assign</Trans>
          </DataList.Label>
          <DataList.Value>
            <AssigneesAttribute />
          </DataList.Value>
        </DataList.Item>
      )}
    </DataList.Root>
  );
};

export default AssignmentAttributes;
