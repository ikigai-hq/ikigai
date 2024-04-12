import { useMutation } from "@apollo/client";

import {
  GetRubrics_orgGetRubrics as IRubric,
  RubricInput,
  RubricTableDataInput,
  RubricTableItemInput,
  RubricType,
  UpsertRubric,
} from "graphql/types";
import { UPSERT_RUBRIC } from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";
import {
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { ChangeEvent, useMemo, useState } from "react";
import { cloneDeep } from "lodash";
import { ColumnsType } from "antd/es/table";
import { t, Trans } from "@lingui/macro";
import { Button, TextButtonWithHover } from "components/common/Button";
import toast from "react-hot-toast";
import { ArrowRightOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { roundRealNumber } from "util/index";

export type RubricRecordType = {
  criteria: string;
  criteriaIndex: number;
  weightingCriteria: number;
  criteriaItems: RubricTableItemInput[];
  rowKey: string;
};

const defaultRubricItem: RubricTableItemInput = {
  explanation: "",
  score: 0,
  toScore: 0,
  userPick: {
    selected: false,
    score: 0,
    comment: "",
  },
};

export const getRubricItems = (rubric: RubricTableDataInput) => {
  const result: RubricRecordType[] = [];
  
  rubric.criteria.forEach((criteria, criteriaIndex) => {
    const items = rubric.items[criteriaIndex];
    const criteriaItems: RubricTableItemInput[] = [];
    rubric.level.forEach((level, levelIndex) => {
      criteriaItems.push(items[levelIndex] || {...defaultRubricItem});
    });
    const weightingCriteria = rubric.weightingCriteria[criteriaIndex] || 1.0;
    
    result.push({
      criteria,
      criteriaIndex,
      weightingCriteria,
      criteriaItems,
      rowKey: `${criteria}--${criteriaIndex}${JSON.stringify(criteriaItems)}`,
    });
  });
  
  return result;
};

const getRubricTableDataInput = (
  rubricType: RubricType,
  levels: string[],
  rubricItems: RubricRecordType[],
): RubricTableDataInput => {
  const criteria = rubricItems.map(record => record.criteria);
  const weightingCriteria = rubricItems.map(record => record.weightingCriteria);
  const items: RubricTableItemInput[][] = [];
  
  rubricItems.forEach(rubricRecord => {
    items.push(rubricRecord.criteriaItems);
  });
  
  return {
    level: levels,
    rubricType,
    criteria,
    weightingCriteria,
    items,
  };
};

export type RubricProps= {
  rubric: IRubric;
  afterSave: () => void;
  readOnly?: boolean;
};

const Rubric = ({ rubric, afterSave, readOnly }: RubricProps) => {
  const [rubricType, setRubricType] = useState(rubric.data.rubricType);
  const [name, setName] = useState(rubric.name);
  const [items, setItems] = useState(getRubricItems(rubric.data));
  const [levels, setLevels] = useState(rubric.data.level);
  const [upsertRubric, { loading }] = useMutation<UpsertRubric>(UPSERT_RUBRIC, {
    onError: handleError,
  });
  
  const onSave = async () => {
    if (readOnly) return;
    const rubricInput: RubricInput = {
      id: rubric.id,
      orgId: rubric.orgId,
      name,
      data: getRubricTableDataInput(rubricType, levels, items),
    };
    
    const { data } = await upsertRubric({ variables: { rubric: rubricInput }});
    if (data) {
      toast.success(t`Successfully!`);
      afterSave();
    }
  };
  
  const onChangeCriteria = (index: number) => (value: ChangeEvent<HTMLTextAreaElement>) => {
    items[index].criteria = value.currentTarget.value;
    setItems([...items]);
  };
  
  const onChangeWeightingCriteria = (index: number) => (weightingCriteria: number) => {
    items[index].weightingCriteria = roundRealNumber(weightingCriteria / 100);
    setItems([...items]);
  };
  
  const onChangeScore = (criteriaIndex: number, levelIndex: number) => (value: number) => {
    const item = items[criteriaIndex].criteriaItems[levelIndex];
    item.score = roundRealNumber(value);
    setItems([...items]);
  };
  
  const onChangeToScore = (criteriaIndex: number, levelIndex: number) => (value: number) => {
    const item = items[criteriaIndex].criteriaItems[levelIndex];
    item.toScore = roundRealNumber(value);
    setItems([...items]);
  };
  
  const onChangeExplanation = (criteriaIndex: number, levelIndex: number) => (e: ChangeEvent<HTMLTextAreaElement>) => {
    const item = items[criteriaIndex].criteriaItems[levelIndex];
    item.explanation = e.currentTarget.value;
    setItems([...items]);
  };
  
  const onChangeLevel = (levelIndex: number) => (e: ChangeEvent<HTMLInputElement>) => {
    levels[levelIndex] = e.currentTarget.value;
    setLevels([...levels]);
  };
  
  const addNewCriteria = () => {
    const data = getRubricTableDataInput(rubricType, levels, items);
    data.criteria.push("");
    data.items.push([]);
    setItems(getRubricItems(data));
  };
  
  const onRemoveCriteria = (criteriaIndex: number) => {
    items.splice(criteriaIndex, 1);
    const data = getRubricTableDataInput(rubricType, levels, items);
    setItems(getRubricItems(data));
  };
  
  const addNewLevel = () => {
    const data = getRubricTableDataInput(rubricType, levels, items);
    data.level.push("");
    setItems(getRubricItems(data));
  };
  
  const onRemoveLevel = (levelIndex: number) => {
    levels.splice(levelIndex, 1);
    items.forEach(item => {
      item.criteriaItems.splice(levelIndex, 1);
    });
    const data = getRubricTableDataInput(rubricType, levels, items);
    setItems(getRubricItems(data));
  };
  
  const columns: ColumnsType<RubricRecordType>  = useMemo(() => {
    const items: ColumnsType<RubricRecordType> =
      [
        {
          title: t`Criteria`,
          dataIndex: "criteria",
          key: "criteria",
          width: 200,
          fixed: "left",
          render: (criterion: string, record, index) =>
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              <InputNumber
                style={{ width: "100%" }}
                suffix={<Typography.Text type="secondary"><Trans>% of total grade</Trans></Typography.Text>}
                value={roundRealNumber(record.weightingCriteria * 100)}
                onChange={onChangeWeightingCriteria(index)}
                readOnly={readOnly}
              />
              <Input.TextArea
                style={{ fontWeight: "bold", padding: 0 }}
                defaultValue={criterion}
                onChange={onChangeCriteria(index)}
                autoSize={{
                  minRows: 2,
                  maxRows: 10,
                }}
                placeholder={t`Typing criteria`}
                bordered={false}
                readOnly={readOnly}
              />
            </div>
        },
        ...levels.map((level, levelIndex) => {
          return {
            title: <StyledLevelInput
              defaultValue={level}
              onChange={onChangeLevel(levelIndex)}
              bordered={false}
              placeholder={t`Typing level`}
              readOnly={readOnly}
              suffix={
                readOnly ? undefined :
                  <Popconfirm
                    title={t`Do you want to remove ${level}?`}
                    onConfirm={() => onRemoveLevel(levelIndex)}
                  >
                    <TextButtonWithHover
                      type="text"
                      icon={<MinusCircleOutlined />}
                      style={{ color: "red" }}
                    />
                  </Popconfirm>
              }
            />,
            width: 300,
            key: level,
            dataIndex: level,
            render: (_, record: RubricRecordType, index: number) => {
              const item = record.criteriaItems[levelIndex] || cloneDeep(defaultRubricItem);
              return (
                <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
                  {
                    rubricType === RubricType.POINT_BASED &&
                    <InputNumber
                      suffix={<Typography.Text type="secondary"><Trans>point</Trans></Typography.Text>}
                      value={item.score}
                      onChange={onChangeScore(index, levelIndex)}
                      style={{ width: "110px" }}
                      min={0}
                      max={100}
                      readOnly={readOnly}
                    />
                  }
                  {
                    rubricType === RubricType.POINT_RANGE &&
                    <div style={{ display: "flex", alignContent: "baseline", gap: 5}}>
                      <InputNumber
                        suffix={<Typography.Text type="secondary"><Trans>point</Trans></Typography.Text>}
                        value={roundRealNumber(item.score)}
                        onChange={onChangeScore(index, levelIndex)}
                        style={{ width: "110px" }}
                        min={0}
                        max={100}
                        readOnly={readOnly}
                        placeholder={t`From point`}
                      />
                      <ArrowRightOutlined />
                      <InputNumber
                        suffix={<Typography.Text type="secondary"><Trans>point</Trans></Typography.Text>}
                        value={roundRealNumber(item.toScore)}
                        onChange={onChangeToScore(index, levelIndex)}
                        style={{ width: "110px" }}
                        min={0}
                        max={100}
                        readOnly={readOnly}
                        placeholder={t`To point`}
                      />
                    </div>
                  }
                  <Input.TextArea
                    value={item.explanation}
                    rows={3}
                    onChange={onChangeExplanation(index, levelIndex)}
                    autoSize={{
                      minRows: 2,
                      maxRows: 10,
                    }}
                    bordered={false}
                    placeholder={t`Typing your description`}
                    style={{ padding: 0 }}
                    readOnly={readOnly}
                  />
                </div>
              );
            },
          };
        }),
      ];
    if (!readOnly) {
      items.push(
        {
          title: "",
          dataIndex: "actions",
          key: "actions",
          width: 70,
          fixed: "right",
          render: (_, item, index) => (
            <Popconfirm
              title={t`Do you want to remove ${item.criteria}?`}
              onConfirm={() => onRemoveCriteria(index)}
            >
              <TextButtonWithHover
                type="text"
                icon={<MinusCircleOutlined />}
                style={{ color: "red" }}
              />
            </Popconfirm>
          ),
        }
      );
    }
    return items;
  }, [levels.length, items.length, rubricType]);
  
  let totalGrade = 0;
  items.forEach(item => totalGrade += item.weightingCriteria);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}>
      <div style={{ display: "flex" }}>
        <Typography.Title
          key={rubric.id}
          contentEditable={!readOnly}
          style={{
            borderBottom: "1px solid black",
            marginTop: "0",
            flex: 1,
          }}
          onInput={e => setName(e.currentTarget.textContent)}
          suppressContentEditableWarning={true}
        >
          {rubric.name}
        </Typography.Title>
        {
          !readOnly &&
          <Button
            type="primary"
            onClick={onSave}
            loading={loading}
            disabled={loading}
            style={{ height: "fit-content", marginLeft: "15px" }}
          >
            <Trans>
              Save
            </Trans>
          </Button>
        }
      </div>
      <div style={{ marginBottom: "5px" }}>
        <Typography.Text strong><Trans>Rubric Type</Trans></Typography.Text>
        <Select value={rubricType} onChange={setRubricType} style={{ width: "130px", marginLeft: "5px" }}>
          <Select.Option value={RubricType.POINT_BASED}>Point Based</Select.Option>
          <Select.Option value={RubricType.POINT_RANGE}>Point Range</Select.Option>
        </Select>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex"  }}>
          <Table
            rowKey={"rowKey"}
            style={{ flex: 1, overflow: "auto" }}
            columns={columns}
            dataSource={items}
            pagination={false}
            scroll={{
              x: 700,
              y: 700,
            }}
          />
          {
            !readOnly &&
            <div
              style={{
                height: "inherit",
                display: "flex",
                alignItems: "center",
                marginLeft: "5px",
              }}
            >
              <Tooltip title={t`Add level`} arrow={false}>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addNewLevel}
                />
              </Tooltip>
            </div>
          }
        </div>
        <div>
          <Typography.Text>
            <Trans>
              <Typography.Text type={totalGrade !== 1 ? "danger" : "success"} strong>
                <Trans>{roundRealNumber(totalGrade * 100)}%</Trans>
              </Typography.Text> of grade
            </Trans>
          </Typography.Text>
        </div>
        {
          !readOnly &&
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: "5px" }}
          >
            <Tooltip title={t`Add criteria`} arrow={false}>
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={addNewCriteria}
              />
            </Tooltip>
          </div>
        }
      </div>
    </div>
  );
};

const StyledLevelInput = styled(Input)`
  & > input {
    font-weight: bold;
  }
`;

export default Rubric;
