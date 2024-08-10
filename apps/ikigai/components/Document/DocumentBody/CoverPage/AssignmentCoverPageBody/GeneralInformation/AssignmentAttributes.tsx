import { DataList, Text, Link } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";
import React from "react";
import NextLink from "next/link";

import TestDurationAttribute from "./TestDurationAttribute";
import {
  DocumentActionPermission,
  DocumentVisibility,
  Role,
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
import useAuthUserStore from "store/AuthStore";
import { formatDocumentRoute } from "../../../../../../config/Routes";

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
  const isStudent = useAuthUserStore((state) => state.role === Role.STUDENT);
  const allow = usePermission();
  const { orderedQuizzes } = useOrderedQuizzes();
  const totalQuizAssignment = useDocumentStore(
    (state) => state.activeDocument?.assignment?.totalQuiz || 0,
  );
  const visibility = useDocumentStore(
    (state) => state.activeDocument?.visibility,
  );
  const submissions = useDocumentStore((state) => state.submissions);
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

  const lastSubmission = isStudent
    ? submissions.sort(
        (submissionA, submissionB) =>
          submissionB.attemptNumber - submissionA.attemptNumber,
      )[0]
    : undefined;

  return (
    <DataList.Root>
      {isStudent && lastSubmission && (
        <DataList.Item>
          <DataList.Label minWidth="88px" color="indigo">
            <Trans>Your Grade</Trans>
          </DataList.Label>
          <DataList.Value>
            <NextLink
              href={formatDocumentRoute(lastSubmission.documentId)}
              passHref
            >
              <Link weight="bold" color="indigo" target="_blank">
                {(lastSubmission.finalGrade || 0).toFixed(2)}
              </Link>
            </NextLink>
          </DataList.Value>
        </DataList.Item>
      )}
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
