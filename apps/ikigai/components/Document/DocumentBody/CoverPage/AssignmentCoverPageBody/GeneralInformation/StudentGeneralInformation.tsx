import { Trans } from "@lingui/macro";
import { Col, Radio, Row, Typography } from "antd";
import { IconClock, IconTicket } from "@tabler/icons-react";
import React from "react";
import { isNil } from "lodash";

import useDocumentStore from "store/DocumentStore";
import styled, { useTheme } from "styled-components";

const StudentGeneralInformation = () => {
  const theme = useTheme();
  const assignment = useDocumentStore(
    (state) => state.activeDocument?.assignment,
  );
  if (!assignment) return <></>;

  return (
    <div>
      <Row>
        <Col span={24}>
          <ItemContainer style={{ marginBottom: 10 }}>
            <Typography.Text strong>
              <Trans>Description</Trans>
            </Typography.Text>
            <div>
              <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                {assignment.preDescription}
              </Typography.Paragraph>
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
              {isNil(assignment.testDuration) && (
                <Radio checked>
                  <Trans>Unlimited</Trans>
                </Radio>
              )}
            </div>
            <div>
              {!isNil(assignment.testDuration) && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <IconClock
                    size={20}
                    stroke={1.5}
                    color={theme.colors.gray[5]}
                  />
                  {assignment.testDuration} minutes
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
              {isNil(assignment.maxNumberOfAttempt) && (
                <Radio checked>
                  <Trans>Unlimited</Trans>
                </Radio>
              )}
            </div>
            <div>
              {!isNil(assignment.maxNumberOfAttempt) && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <IconTicket
                    size={20}
                    stroke={1.5}
                    color={theme.colors.gray[5]}
                  />
                  {assignment.maxNumberOfAttempt} attempts
                </div>
              )}
            </div>
          </ItemContainer>
        </Col>
      </Row>
    </div>
  );
};

const ItemContainer = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export default StudentGeneralInformation;
