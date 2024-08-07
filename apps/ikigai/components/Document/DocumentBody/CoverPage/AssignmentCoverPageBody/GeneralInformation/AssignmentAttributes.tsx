import { DataList, Text } from "@radix-ui/themes";
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
import useUpdateDocument from "hook/UseUpdateDocument";
import VisibilityAttribute from "./VisibilityAttribute";
import TagAttribute from "./TagAttribute";

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
            <VisibilityAttribute
              visibility={visibility}
              onChangeVisibility={onChangeVisibility}
            />
          </DataList.Value>
        </DataList.Item>
      )}
      {allow(DocumentActionPermission.MANAGE_DOCUMENT) &&
        visibility !== DocumentVisibility.PRIVATE && (
          <DataList.Item>
            <DataList.Label minWidth="88px">
              <Trans>Assign</Trans>
            </DataList.Label>
            <DataList.Value>
              <AssigneesAttribute />
            </DataList.Value>
          </DataList.Item>
        )}
      <DataList.Item>
        <DataList.Label minWidth="88px">
          <Trans>Tags</Trans>
        </DataList.Label>
        <DataList.Value>
          <TagAttribute
            readOnly={!allow(DocumentActionPermission.MANAGE_DOCUMENT)}
          />
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
};

export default AssignmentAttributes;
