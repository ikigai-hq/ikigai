import { t, Trans } from "@lingui/macro";
import { Divider, InputNumber, Tooltip, Typography } from "antd";
import styled from "styled-components";
import React, { useState } from "react";

import { Text } from "components/common/Text";
import {
  GetDocumentDetail_documentGet_submission_rubricGrade as IRubricGrade,
  GradeRubricSubmission,
  RubricType,
} from "graphql/types";
import { Permission } from "util/permission";
import useUserPermission from "hook/UseUserPermission";
import { useMutation } from "@apollo/client";
import { GRADE_RUBRIC_SUBMISSION } from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";
import { cloneDeep } from "lodash";
import { roundRealNumber } from "../../../util";

export type RubricSectionProps = {
  rubric: IRubricGrade;
  onChangeFinalScore: (score: number) => void;
};

const RubricSection = ({ rubric, onChangeFinalScore }: RubricSectionProps) => {
  const allow = useUserPermission();
  const canGrade = allow(Permission.ManageSpaceContent);
  const [insideRubric, setInsideRubric] = useState(cloneDeep(rubric));
  const [gradeRubric] = useMutation<GradeRubricSubmission>(
    GRADE_RUBRIC_SUBMISSION,
    {
      onError: handleError,
    },
  );

  const onSelectLevel = async (
    criteriaIndex: number,
    levelIndex: number,
    defaultScore?: number,
  ) => {
    if (!canGrade) return;

    const items = insideRubric.gradedData.items[criteriaIndex];
    // Reset Phase
    items.forEach((item) => {
      item.userPick.selected = false;
      item.userPick.score = 0;
    });

    // Select Phase
    const item = items[levelIndex];
    item.userPick.selected = true;
    item.userPick.score = defaultScore || item.score;

    const { data } = await gradeRubric({
      variables: {
        data: {
          submissionId: rubric.submissionId,
          rubricId: rubric.rubricId,
          gradedData: {
            rubricType: insideRubric.gradedData.rubricType,
            criteria: insideRubric.gradedData.criteria,
            weightingCriteria: insideRubric.gradedData.weightingCriteria,
            level: insideRubric.gradedData.level,
            items: insideRubric.gradedData.items,
          },
        },
      },
    });

    if (data) {
      insideRubric.gradedData.totalUserScore =
        data.assignmentUpdateRubricSubmission.gradedData.totalUserScore;
      setInsideRubric({ ...insideRubric });
      onChangeFinalScore(insideRubric.gradedData.totalUserScore);
    }
  };

  const getSelectedScore = (criteriaIndex: number) =>
    insideRubric.gradedData.items[criteriaIndex].find(
      (item) => item.userPick.selected,
    );

  const renderSelectedScore = (criteriaIndex: number) => {
    const selectedScore = getSelectedScore(criteriaIndex);
    const selectedScoreIndex = insideRubric.gradedData.items[
      criteriaIndex
    ].findIndex((item) => item.userPick.selected);
    if (!selectedScore || selectedScoreIndex < 0) return <></>;

    const readOnly =
      !canGrade ||
      insideRubric.gradedData.rubricType === RubricType.POINT_BASED;
    return (
      <Tooltip
        arrow={false}
        title={!readOnly ? t`Edit score` : undefined}
        popupVisible={
          insideRubric.gradedData.rubricType !== RubricType.POINT_BASED
        }
      >
        <InputNumber
          size="small"
          value={roundRealNumber(selectedScore.userPick.score)}
          onChange={(e) =>
            onSelectLevel(criteriaIndex, selectedScoreIndex, roundRealNumber(e))
          }
          min={selectedScore.score}
          max={selectedScore.toScore}
          controls={false}
          style={{ width: "40px" }}
          readOnly={readOnly}
        />
      </Tooltip>
    );
  };

  return (
    <div>
      <Divider />
      <Text type="secondary" color={"#888E9C"}>
        <Trans>RUBRIC</Trans>
      </Text>
      {insideRubric.gradedData.criteria.map((criteria, criteriaIndex) => (
        <div style={{ marginTop: "10px" }} key={criteria}>
          <div
            style={{ display: "flex", alignItems: "baseline", width: "100%" }}
          >
            <Text type="secondary" color={"#888E9C"} strong style={{ flex: 1 }}>
              {criteria} (
              {roundRealNumber(
                (insideRubric.gradedData.weightingCriteria[criteriaIndex] ||
                  1) * 100,
              )}
              %)
            </Text>
            {renderSelectedScore(criteriaIndex)}
          </div>
          {(insideRubric.gradedData.items[criteriaIndex] || []).map(
            (item, levelIndex) => (
              <CriteriaLevelContainer
                key={levelIndex}
                $selected={item.userPick.selected}
                $canGrade={canGrade}
                onClick={() => onSelectLevel(criteriaIndex, levelIndex)}
              >
                <div style={{ flex: 1 }}>
                  <Typography.Text type="secondary" strong>
                    {insideRubric.gradedData.level[levelIndex]}
                    <br />
                  </Typography.Text>
                  <Typography.Paragraph type="secondary">
                    {item.explanation}
                  </Typography.Paragraph>
                </div>
                <div>
                  {insideRubric.gradedData.rubricType ===
                    RubricType.POINT_BASED && (
                    <Typography.Text strong>{item.score}</Typography.Text>
                  )}
                  {insideRubric.gradedData.rubricType ===
                    RubricType.POINT_RANGE && (
                    <Typography.Text strong>
                      {item.score} - {item.toScore}
                    </Typography.Text>
                  )}
                </div>
              </CriteriaLevelContainer>
            ),
          )}
        </div>
      ))}
    </div>
  );
};

const CriteriaLevelContainer = styled.div<{
  $selected: boolean;
  $canGrade: boolean;
}>`
  border: 1px solid ${(props) => props.theme.colors.gray[3]};
  padding: 4px;
  margin-top: 5px;
  display: flex;
  cursor: pointer;
  background-color: ${(props) => (props.$selected ? "#52C41A" : "unset")};

  :hover {
    background-color: ${(props) =>
      props.$canGrade ? "rgba(82,196,26,0.62)" : undefined};
  }
`;

export default RubricSection;
