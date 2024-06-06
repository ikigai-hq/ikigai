import { t, Trans } from "@lingui/macro";
import React, { ChangeEvent, useState } from "react";
import { Flex, TextArea, Button } from "@radix-ui/themes";

import { DocumentActionPermission, UpdateAssignmentData } from "graphql/types";
import useUpdateAssignment from "hook/UseUpdateAssignment";
import useDocumentStore from "store/DocumentStore";
import AssignmentAttributes from "./AssignmentAttributes";
import usePermission from "hook/UsePermission";

const GeneralInformation = () => {
  const allow = usePermission();
  const canEdit = allow(DocumentActionPermission.EDIT_DOCUMENT);
  const {
    updateAssignment,
    res: { loading },
  } = useUpdateAssignment();
  const assignment = useDocumentStore(
    (state) => state.activeDocument?.assignment,
  );
  const [innerAssignment, setInnerAssignment] = useState<UpdateAssignmentData>({
    bandScoreId: assignment.bandScoreId,
    forceAutoSubmit: assignment.forceAutoSubmit,
    gradeByRubricId: assignment.gradeByRubricId,
    gradeMethod: assignment.gradeMethod,
    maxNumberOfAttempt: assignment.maxNumberOfAttempt,
    preDescription: assignment.preDescription,
    testDuration: assignment.testDuration,
  });

  const onChangeInnerAssignment = (data: Partial<UpdateAssignmentData>) => {
    setInnerAssignment({
      ...innerAssignment,
      ...data,
    });
  };
  const onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChangeInnerAssignment({ preDescription: e.currentTarget.value });
  };

  if (!innerAssignment) return <></>;

  return (
    <div>
      <AssignmentAttributes
        data={innerAssignment}
        onChange={setInnerAssignment}
        canEdit={canEdit}
      />
      <Flex direction="column" gap="3" pt="10px">
        <TextArea
          placeholder={t`Typing assignment description or guide...`}
          value={innerAssignment.preDescription}
          onChange={onChangeDescription}
          resize="vertical"
          readOnly={!canEdit}
        />
      </Flex>
      {canEdit && (
        <div style={{ marginTop: "10px" }}>
          <Button
            onClick={() => updateAssignment(innerAssignment)}
            loading={loading}
            disabled={loading}
          >
            <Trans>Update</Trans>
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneralInformation;
