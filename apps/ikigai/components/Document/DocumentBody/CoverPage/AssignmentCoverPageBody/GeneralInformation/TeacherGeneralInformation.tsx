import { t, Trans } from "@lingui/macro";
import {
  Button,
  Col,
  Divider,
  Input,
  InputNumber,
  Radio,
  RadioChangeEvent,
  Row,
  Typography,
} from "antd";
import { IconClock, IconTicket } from "@tabler/icons-react";
import React, { ChangeEvent, useState } from "react";
import { isNil } from "lodash";

import { UpdateAssignmentData } from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import styled, { useTheme } from "styled-components";
import useUpdateAssignment from "hook/UseUpdateAssignment";

const TeacherGeneralInformation = () => {
  const theme = useTheme();
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

  const onChangeTestDurationOption = (e: RadioChangeEvent) => {
    const limited = e.target.value;
    if (limited) {
      onChangeInnerAssignment({ testDuration: 1800 });
    } else {
      onChangeInnerAssignment({ testDuration: undefined });
    }
  };

  const onChangeAttempts = (e: RadioChangeEvent) => {
    const limited = e.target.value;
    if (limited) {
      onChangeInnerAssignment({ maxNumberOfAttempt: 1 });
    } else {
      onChangeInnerAssignment({ maxNumberOfAttempt: undefined });
    }
  };

  const update = () => {
    updateAssignment(innerAssignment);
  };

  if (!innerAssignment) return <></>;

  return (
    <div>
      <Row>
        <Col span={24}>
          <ItemContainer style={{ marginBottom: 10 }}>
            <Typography.Text strong>
              <Trans>Description</Trans>
            </Typography.Text>
            <div>
              <Input.TextArea
                placeholder={t`Typing assignment description...`}
                autoSize={{ minRows: 2 }}
                value={innerAssignment.preDescription}
                onChange={onChangeDescription}
              />
            </div>
          </ItemContainer>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <ItemContainer>
            <Typography.Text strong>
              <Trans>Test Duration</Trans>
            </Typography.Text>
            <div>
              <Radio.Group
                value={!isNil(innerAssignment.testDuration)}
                onChange={onChangeTestDurationOption}
              >
                <Radio value={true}>Limited time</Radio>
                <Radio value={false}>Unlimited time</Radio>
              </Radio.Group>
            </div>
            <div>
              {!isNil(innerAssignment.testDuration) && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <InputNumber
                    min={0}
                    style={{ width: "100px" }}
                    prefix={
                      <IconClock
                        size={20}
                        stroke={1.5}
                        color={theme.colors.gray[5]}
                      />
                    }
                    value={innerAssignment.testDuration / 60}
                    onChange={(e) =>
                      onChangeInnerAssignment({
                        testDuration: (e || 0) * 60,
                      })
                    }
                    step={1}
                  />
                  <Typography.Text type="secondary">
                    <Trans>minutes</Trans>
                  </Typography.Text>
                </div>
              )}
            </div>
          </ItemContainer>
        </Col>
        <Col span={12}>
          <ItemContainer>
            <Typography.Text strong>
              <Trans>Max Attempts</Trans>
            </Typography.Text>
            <div>
              <Radio.Group
                value={!isNil(innerAssignment.maxNumberOfAttempt)}
                onChange={onChangeAttempts}
              >
                <Radio value={true}>Limited</Radio>
                <Radio value={false}>Unlimited</Radio>
              </Radio.Group>
            </div>
            <div>
              {!isNil(innerAssignment.maxNumberOfAttempt) && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <InputNumber
                    min={0}
                    max={1000}
                    style={{ width: "100px" }}
                    prefix={
                      <IconTicket
                        size={20}
                        stroke={1.5}
                        color={theme.colors.gray[5]}
                      />
                    }
                    value={innerAssignment.maxNumberOfAttempt}
                    onChange={(e) =>
                      onChangeInnerAssignment({
                        maxNumberOfAttempt: e || 0,
                      })
                    }
                    step={1}
                  />
                  <Typography.Text type="secondary">
                    <Trans>attempts</Trans>
                  </Typography.Text>
                </div>
              )}
            </div>
          </ItemContainer>
        </Col>
      </Row>
      <Divider />
      <Button
        type="primary"
        onClick={update}
        loading={loading}
        disabled={loading}
      >
        <Trans>Update</Trans>
      </Button>
    </div>
  );
};

const ItemContainer = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export default TeacherGeneralInformation;
