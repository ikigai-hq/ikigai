import { t } from "@lingui/macro";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Flex, TextArea } from "@radix-ui/themes";

import { DocumentActionPermission, UpdateAssignmentData } from "graphql/types";
import useUpdateAssignment from "hook/UseUpdateAssignment";
import useDocumentStore from "store/DocumentStore";
import AssignmentAttributes from "./AssignmentAttributes";
import usePermission from "hook/UsePermission";
import { useDebounceFn, usePrevious } from "ahooks";
import { isEqual } from "lodash";

const GeneralInformation = () => {
  const allow = usePermission();
  const canEdit = allow(DocumentActionPermission.EDIT_DOCUMENT);
  const { updateAssignment } = useUpdateAssignment();
  const assignment = useDocumentStore(
    (state) => state.activeDocument?.assignment,
  );
  const [innerAssignment, setInnerAssignment] = useState<UpdateAssignmentData>({
    bandScoreId: assignment.bandScoreId,
    gradeByRubricId: assignment.gradeByRubricId,
    gradeMethod: assignment.gradeMethod,
    maxNumberOfAttempt: assignment.maxNumberOfAttempt,
    preDescription: assignment.preDescription,
    testDuration: assignment.testDuration,
  });
  const previousInnerAssignment = usePrevious(innerAssignment);
  const { run } = useDebounceFn(updateAssignment, { wait: 100, maxWait: 1000 });

  useEffect(() => {
    if (
      canEdit &&
      previousInnerAssignment &&
      !isEqual(innerAssignment, previousInnerAssignment)
    ) {
      run(innerAssignment);
    }
  }, [innerAssignment]);

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
    </div>
  );
};

export default GeneralInformation;
