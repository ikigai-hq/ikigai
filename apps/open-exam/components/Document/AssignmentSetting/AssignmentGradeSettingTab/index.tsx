import { t, Trans } from "@lingui/macro";
import {
  Divider,
  InputNumber,
  Radio,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";

import {
  GetBandScores,
  GetBandScores_assignmentGetBandScores_range_items as BandScoreItem,
  GetRubrics_orgGetRubrics as IRubric,
  GradeMethod,
  GradeType,
  UpdateAssignmentData,
} from "graphql/types";
import { Select } from "components/common/Select";
import Table from "components/common/Table";
import { GET_BAND_SCORES } from "graphql/query/AssignmentQuery";
import { handleError } from "graphql/ApolloClient";
import { TitleSettingSection } from "../common";
import RubricManagement from "./RubricManagement";
import { TextButtonWithHover } from "components/common/Button";
import { UnorderedListOutlined } from "@ant-design/icons";
import EditRubric from "./EditRubric";
import { roundRealNumber } from "util/index";

export type AssignmentGradeSettingTabProps = {
  updateData: UpdateAssignmentData;
  rubric?: IRubric;
  onChangeValue: (key: keyof UpdateAssignmentData) => (value: any) => void;
};

const AssignmentGradeSettingTab = ({
  updateData,
  rubric,
  onChangeValue,
}: AssignmentGradeSettingTabProps) => {
  const { data: bandScoresData } = useQuery<GetBandScores>(GET_BAND_SCORES, {
    onError: handleError,
  });
  const [insideRubric, setInsideRubric] = useState(rubric);
  const selectedBandScore = bandScoresData?.assignmentGetBandScores.find(
    (bandScore) => bandScore.id === updateData.bandScoreId,
  );
  const [openRubricManagement, setOpenRubricManagement] = useState(false);
  const [viewRubric, setViewRubric] = useState(false);

  useEffect(() => {
    setInsideRubric(rubric);
  }, [rubric]);

  const bandscoreColumns = [
    {
      title: t`Correct answers`,
      dataIndex: "correctAnswer",
      key: "correctAnswer",
      render: (_, range: BandScoreItem) => (
        <p>
          {range.from} - {range.to}
        </p>
      ),
    },
    {
      title: t`Band score`,
      dataIndex: "score",
      key: "score",
    },
  ];

  let weightingIntoFinalGrade = updateData.weightingIntoFinalGrade * 100;
  weightingIntoFinalGrade = roundRealNumber(weightingIntoFinalGrade);

  return (
    <div>
      <TitleSettingSection>
        <Trans>Type</Trans>
      </TitleSettingSection>
      <div>
        {updateData.gradedType === GradeType.NON_GRADE && (
          <Typography.Text type="secondary">
            <Trans>This assignment will not be counted into final grade.</Trans>
          </Typography.Text>
        )}
        {updateData.gradedType === GradeType.GRADE && (
          <Typography.Text type="secondary">
            <Trans>This assignment will be counted into final grade.</Trans>
          </Typography.Text>
        )}
      </div>
      <Radio.Group
        value={updateData.gradedType}
        onChange={(e) => onChangeValue("gradedType")(e.target.value)}
      >
        <Space direction="vertical">
          <Radio value={GradeType.NON_GRADE}>
            <Trans>Ungraded</Trans>
          </Radio>
          <Radio value={GradeType.GRADE}>
            <Trans>Graded</Trans>
          </Radio>
        </Space>
      </Radio.Group>
      {updateData.gradedType === GradeType.GRADE && (
        <div>
          <InputNumber
            style={{ width: "170px", marginTop: "10px" }}
            suffix={
              <Typography.Text type="secondary">
                <Trans>% of final grade</Trans>
              </Typography.Text>
            }
            min={0}
            max={100}
            value={weightingIntoFinalGrade}
            onChange={(weight) => {
              const weightingIntoFinalGrade = weight / 100;
              onChangeValue("weightingIntoFinalGrade")(weightingIntoFinalGrade);
            }}
          />
        </div>
      )}
      <Divider />
      <TitleSettingSection>
        <Trans>Method</Trans>
      </TitleSettingSection>
      <Radio.Group
        value={updateData.gradeMethod}
        onChange={(e) => onChangeValue("gradeMethod")(e.target.value)}
      >
        <Space direction="vertical">
          <Radio value={GradeMethod.MANUAL}>
            <Trans>Manual</Trans>
          </Radio>
          <Radio value={GradeMethod.AUTO_GRADE}>
            <Trans>Auto</Trans>
          </Radio>
          <Radio value={GradeMethod.RUBRIC}>
            <Trans>Rubric</Trans>
          </Radio>
        </Space>
      </Radio.Group>
      <div style={{ marginTop: "5px" }}>
        <Typography.Text type="secondary">
          {updateData.gradeMethod === GradeMethod.MANUAL && (
            <Trans>
              Open Exam will try to pre-calculate score of submissions. But
              teacher need to review submission and feedback to student.
            </Trans>
          )}
          {updateData.gradeMethod === GradeMethod.AUTO_GRADE && (
            <Trans>
              Open Exam will auto calculate score and release to student.
            </Trans>
          )}
          {updateData.gradeMethod === GradeMethod.RUBRIC && (
            <Trans>
              Setup the rubric for this assignment. Teacher will grade
              submissions by following the rubric criteria.
            </Trans>
          )}
        </Typography.Text>
      </div>
      {updateData.gradeMethod !== GradeMethod.RUBRIC && (
        <div style={{ marginTop: "10px" }}>
          <Typography.Text strong>
            <Trans>Band Score</Trans>
          </Typography.Text>
          <div>
            <Select
              style={{ width: "320px" }}
              value={updateData.bandScoreId}
              onChange={onChangeValue("bandScoreId")}
              size="large"
              allowClear
              placeholder={t`Select a bandscore`}
            >
              {bandScoresData?.assignmentGetBandScores.map((bandScore) => (
                <Select.Option value={bandScore.id} key={bandScore.id}>
                  {bandScore.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          {selectedBandScore && <Divider />}
          {selectedBandScore && (
            <Table
              rowKey={"score"}
              columns={bandscoreColumns}
              dataSource={selectedBandScore.range.items}
              style={{ maxHeight: "270px", overflowY: "auto" }}
              pagination={false}
            />
          )}
        </div>
      )}
      {updateData.gradeMethod === GradeMethod.RUBRIC && (
        <div style={{ marginTop: "10px" }}>
          <Typography.Title level={5}>
            <Trans>Rubric Config</Trans>
          </Typography.Title>
          <div style={{ display: "flex" }}>
            {insideRubric && (
              <Tag
                color="success"
                style={{
                  height: "fit-content",
                  marginLeft: 0,
                  cursor: "pointer",
                }}
                onClick={() => setViewRubric(true)}
              >
                {insideRubric.name}
              </Tag>
            )}
            <Tooltip title={t`Change or Edit`} arrow={false}>
              <TextButtonWithHover
                size="small"
                icon={<UnorderedListOutlined />}
                onClick={() => setOpenRubricManagement(true)}
                type="text"
              />
            </Tooltip>
          </div>
          <RubricManagement
            selectedRubricId={insideRubric?.id}
            onChangeSelected={(rubric) => {
              if (rubric && rubric.id !== updateData.gradeByRubricId) {
                onChangeValue("gradeByRubricId")(rubric.id);
              }
              setInsideRubric(rubric);
              setOpenRubricManagement(false);
            }}
            visible={openRubricManagement}
            onClose={() => setOpenRubricManagement(false)}
          />
          {rubric && viewRubric && (
            <EditRubric
              visible={viewRubric}
              onClose={() => setViewRubric(false)}
              rubric={rubric}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentGradeSettingTab;
