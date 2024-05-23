import { Col, Radio, Row, Typography } from "antd";
import styled from "styled-components";
import React, { useState } from "react";
import { t, Trans } from "@lingui/macro";

import { GetAssignmentRubric, GradeMethod } from "graphql/types";
import useDocumentStore from "store/DocumentStore";
import ViewOrEditRubric from "components/Rubric/ViewOrEditRubric";
import { TextButtonWithHover } from "components/common/Button";
import { useQuery } from "@apollo/client";
import { GET_ASSIGNMENT_RUBRIC } from "graphql/query/AssignmentQuery";
import { handleError } from "graphql/ApolloClient";

const StudentGradeInformation = () => {
  const [openRubric, setOpenRubric] = useState(false);
  const assignment = useDocumentStore(
    (state) => state.activeDocument?.assignment,
  );
  const documentId = useDocumentStore((state) => state.activeDocumentId);
  const { data } = useQuery<GetAssignmentRubric>(GET_ASSIGNMENT_RUBRIC, {
    onError: handleError,
    skip: !documentId,
    variables: {
      documentId,
    },
  });

  const rubric = data?.documentGet?.assignment?.rubric;
  return (
    <div>
      <Row>
        <Col span={24}>
          <ItemContainer>
            <Typography.Text strong>
              <Trans>Grade</Trans>
            </Typography.Text>
            <div>
              <Radio checked>
                {assignment.gradeMethod === GradeMethod.AUTO
                  ? t`Auto`
                  : t`Manual`}
              </Radio>
            </div>
            <div>
              {assignment.gradeMethod === GradeMethod.MANUAL && (
                <Typography.Text type="secondary">
                  <Trans>
                    In manual mode, students will receive their grades and
                    results only after the teacher has provided feedback.
                  </Trans>
                </Typography.Text>
              )}
              {assignment.gradeMethod === GradeMethod.AUTO && (
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
              <TextButtonWithHover
                type="text"
                onClick={() => setOpenRubric(true)}
              >
                {rubric.name}
              </TextButtonWithHover>
            )}
          </ItemContainer>
        </Col>
      </Row>
      {openRubric && rubric && (
        <ViewOrEditRubric
          visible={openRubric}
          rubric={rubric}
          onClose={() => setOpenRubric(false)}
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
export default StudentGradeInformation;
