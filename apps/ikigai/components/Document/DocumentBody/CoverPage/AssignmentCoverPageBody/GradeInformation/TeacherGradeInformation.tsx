import { Button, Col, Divider, Radio, Row, Tooltip, Typography } from "antd";
import styled from "styled-components";
import React, { useState } from "react";
import { t, Trans } from "@lingui/macro";

import { GradeMethod, UpdateAssignmentData } from "graphql/types";
import useUpdateAssignment from "hook/UseUpdateAssignment";
import useDocumentStore from "store/DocumentStore";
import RubricManagement from "components/Rubric/RubricManagement";
import useRubricStore from "../../../../../../store/RubricStore";
import { TextButtonWithHover } from "../../../../../common/Button";
import { IconEdit, IconTrash, IconX } from "@tabler/icons-react";

const TeacherGradeInformation = () => {
  const [openRubric, setOpenRubric] = useState(false);
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
  const rubric = useRubricStore((state) =>
    state.rubrics.find(
      (rubric) => rubric.id === innerAssignment.gradeByRubricId,
    ),
  );

  const onChangeInnerAssignment = (data: Partial<UpdateAssignmentData>) => {
    setInnerAssignment({
      ...innerAssignment,
      ...data,
    });
  };

  return (
    <div>
      <Row>
        <Col span={24}>
          <ItemContainer>
            <Typography.Text strong>
              <Trans>Grade</Trans>
            </Typography.Text>
            <div>
              <Radio.Group
                value={innerAssignment.gradeMethod}
                onChange={(e) =>
                  onChangeInnerAssignment({ gradeMethod: e.target.value })
                }
              >
                <Radio value={GradeMethod.MANUAL}>Manual</Radio>
                <Radio value={GradeMethod.AUTO}>Auto</Radio>
              </Radio.Group>
            </div>
            <div>
              {innerAssignment.gradeMethod === GradeMethod.MANUAL && (
                <Typography.Text type="secondary">
                  <Trans>
                    In manual mode, students will receive their grades and
                    results only after the teacher has provided feedback.
                  </Trans>
                </Typography.Text>
              )}
              {innerAssignment.gradeMethod === GradeMethod.AUTO && (
                <Typography.Text type="secondary">
                  <Trans>
                    In auto mode, students will receive their grades and results
                    immediately after completing their assessments.
                  </Trans>
                </Typography.Text>
              )}
            </div>
          </ItemContainer>
        </Col>
        <Col span={24}>
          <ItemContainer>
            <Typography.Text strong>
              <Trans>Rubric</Trans>
            </Typography.Text>
            {rubric && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography.Text>{rubric.name}</Typography.Text>
                <Tooltip arrow={false} title={t`Remove`} placement="bottom">
                  <TextButtonWithHover
                    type="text"
                    icon={<IconX size={20} color={"red"} />}
                    onClick={() =>
                      onChangeInnerAssignment({ gradeByRubricId: undefined })
                    }
                  />
                </Tooltip>
              </div>
            )}
            <div>
              <Button onClick={() => setOpenRubric(true)}>
                <Trans>Manage Rubric</Trans>
              </Button>
            </div>
          </ItemContainer>
        </Col>
      </Row>
      <Divider />
      <Button
        type="primary"
        onClick={() => updateAssignment(innerAssignment)}
        loading={loading}
        disabled={loading}
      >
        <Trans>Update</Trans>
      </Button>
      {openRubric && (
        <RubricManagement
          visible={openRubric}
          onClose={() => setOpenRubric(false)}
          onChangeSelected={(item) => {
            onChangeInnerAssignment({ gradeByRubricId: item.id });
            setOpenRubric(false);
          }}
          selectedRubricId={innerAssignment.gradeByRubricId}
        />
      )}
    </div>
  );
};

const ItemContainer = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
export default TeacherGradeInformation;
