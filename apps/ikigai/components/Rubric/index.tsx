import { useMutation } from "@apollo/client";
import { Table } from "antd";
import { cloneDeep, round } from "lodash";
import styled from "styled-components";
import toast from "react-hot-toast";
import { ColumnsType } from "antd/es/table";
import { t, Trans } from "@lingui/macro";
import { ChangeEvent, useMemo, useState } from "react";
import {
  Button,
  Heading,
  IconButton,
  Select,
  Text,
  Tooltip,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { ArrowRightIcon, MinusIcon, PlusIcon } from "@radix-ui/react-icons";

import { UPSERT_RUBRIC } from "graphql/mutation/AssignmentMutation";
import { handleError } from "graphql/ApolloClient";
import useRubricStore, { IRubric } from "store/RubricStore";
import {
  RubricInput,
  RubricTableDataInput,
  RubricTableItemInput,
  RubricType,
  UpsertRubric,
} from "graphql/types";
import AlertDialog from "components/base/AlertDialog";
import InputNumber from "components/base/InputNumber";

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
      criteriaItems.push(items[levelIndex] || { ...defaultRubricItem });
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
  const criteria = rubricItems.map((record) => record.criteria);
  const weightingCriteria = rubricItems.map(
    (record) => record.weightingCriteria,
  );
  const items: RubricTableItemInput[][] = [];

  rubricItems.forEach((rubricRecord) => {
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

export type RubricProps = {
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
  const addRubricStore = useRubricStore((state) => state.addOrUpdateRubric);

  const onSave = async () => {
    if (readOnly) return;
    const rubricInput: RubricInput = {
      id: rubric.id,
      name,
      data: getRubricTableDataInput(rubricType, levels, items),
    };

    const { data } = await upsertRubric({ variables: { rubric: rubricInput } });
    if (data) {
      toast.success(t`Successfully!`);
      addRubricStore(data.userUpsertRubric);
      afterSave();
    }
  };

  const onChangeCriteria =
    (index: number) => (value: ChangeEvent<HTMLTextAreaElement>) => {
      items[index].criteria = value.currentTarget.value;
      setItems([...items]);
    };

  const onChangeWeightingCriteria =
    (index: number) => (weightingCriteria: number) => {
      items[index].weightingCriteria = round(weightingCriteria / 100, 2);
      setItems([...items]);
    };

  const onChangeScore =
    (criteriaIndex: number, levelIndex: number) => (value: number) => {
      const item = items[criteriaIndex].criteriaItems[levelIndex];
      item.score = round(value, 2);
      setItems([...items]);
    };

  const onChangeToScore =
    (criteriaIndex: number, levelIndex: number) => (value: number) => {
      const item = items[criteriaIndex].criteriaItems[levelIndex];
      item.toScore = round(value, 2);
      setItems([...items]);
    };

  const onChangeExplanation =
    (criteriaIndex: number, levelIndex: number) =>
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const item = items[criteriaIndex].criteriaItems[levelIndex];
      item.explanation = e.currentTarget.value;
      setItems([...items]);
    };

  const onChangeLevel =
    (levelIndex: number) => (e: ChangeEvent<HTMLInputElement>) => {
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
    items.forEach((item) => {
      item.criteriaItems.splice(levelIndex, 1);
    });
    const data = getRubricTableDataInput(rubricType, levels, items);
    setItems(getRubricItems(data));
  };

  const columns: ColumnsType<RubricRecordType> = useMemo(() => {
    const items: ColumnsType<RubricRecordType> = [
      {
        title: t`Criteria`,
        dataIndex: "criteria",
        key: "criteria",
        width: 200,
        fixed: "left",
        render: (criterion: string, record, index) => (
          <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
            <InputNumber
              value={record.weightingCriteria}
              onChange={onChangeWeightingCriteria(index)}
              readOnly={readOnly}
              precision={0}
            />
            <TextArea
              style={{ fontWeight: "bold", padding: 0 }}
              defaultValue={criterion}
              onChange={onChangeCriteria(index)}
              placeholder={t`Typing criteria`}
              readOnly={readOnly}
            />
          </div>
        ),
      },
      ...levels.map((level, levelIndex) => {
        return {
          title: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <StyledLevelInput
                defaultValue={level}
                onChange={onChangeLevel(levelIndex)}
                placeholder={t`Typing level`}
                readOnly={readOnly}
              />
              {readOnly ? undefined : (
                <AlertDialog
                  title={t`Do you want to remove ${level}?`}
                  description={t`This action cannot revert!`}
                  onConfirm={() => onRemoveLevel(levelIndex)}
                >
                  <IconButton variant="soft" color={"red"}>
                    <MinusIcon />
                  </IconButton>
                </AlertDialog>
              )}
            </div>
          ),
          width: 300,
          key: level,
          dataIndex: level,
          render: (_, record: RubricRecordType, index: number) => {
            const item =
              record.criteriaItems[levelIndex] || cloneDeep(defaultRubricItem);
            return (
              <div
                style={{ display: "flex", gap: 10, flexDirection: "column" }}
              >
                {rubricType === RubricType.POINT_BASED && (
                  <InputNumber
                    value={item.score}
                    onChange={onChangeScore(index, levelIndex)}
                    readOnly={readOnly}
                    precision={2}
                  />
                )}
                {rubricType === RubricType.POINT_RANGE && (
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    <InputNumber
                      value={item.score}
                      onChange={onChangeScore(index, levelIndex)}
                      readOnly={readOnly}
                      placeholder={t`From point`}
                      precision={2}
                    />
                    <ArrowRightIcon />
                    <InputNumber
                      value={item.toScore}
                      onChange={onChangeToScore(index, levelIndex)}
                      readOnly={readOnly}
                      placeholder={t`To point`}
                      precision={2}
                    />
                  </div>
                )}
                <TextArea
                  value={item.explanation}
                  rows={3}
                  onChange={onChangeExplanation(index, levelIndex)}
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
      items.push({
        title: "",
        dataIndex: "actions",
        key: "actions",
        width: 70,
        fixed: "right",
        render: (_, item, index) => (
          <AlertDialog
            title={t`Do you want to remove ${item.criteria}?`}
            description={t`This action cannot revert!`}
            onConfirm={() => onRemoveCriteria(index)}
          >
            <IconButton variant="soft" color="red">
              <MinusIcon />
            </IconButton>
          </AlertDialog>
        ),
      });
    }
    return items;
  }, [levels.length, items.length, rubricType]);

  let totalGrade = 0;
  items.forEach((item) => (totalGrade += item.weightingCriteria));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", marginBottom: 10 }}>
        <Heading
          key={rubric.id}
          contentEditable={!readOnly}
          style={{
            borderBottom: "1px solid black",
            marginTop: "0",
            flex: 1,
          }}
          onInput={(e) => setName(e.currentTarget.textContent)}
          suppressContentEditableWarning={true}
        >
          {rubric.name}
        </Heading>
        {!readOnly && (
          <Button
            size="2"
            onClick={onSave}
            loading={loading}
            disabled={loading}
          >
            <Trans>Save</Trans>
          </Button>
        )}
      </div>
      {!readOnly && (
        <div
          style={{
            marginBottom: 10,
            display: "flex",
            gap: 5,
            alignItems: "center",
          }}
        >
          <Text weight="bold">
            <Trans>Rubric Type</Trans>
          </Text>
          <Select.Root
            value={rubricType}
            onValueChange={(value) => setRubricType(RubricType[value])}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Item value={RubricType.POINT_BASED}>
                  Point Based
                </Select.Item>
                <Select.Item value={RubricType.POINT_RANGE}>
                  Point Range
                </Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex" }}>
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
          {!readOnly && (
            <div
              style={{
                height: "inherit",
                display: "flex",
                alignItems: "center",
                marginLeft: "5px",
              }}
            >
              <Tooltip content={t`Add level`}>
                <IconButton variant="soft" onClick={addNewLevel}>
                  <PlusIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
        <div>
          <Text>
            <Trans>
              <Text color={totalGrade !== 1 ? "red" : "indigo"}>
                <Trans>{round(totalGrade * 100, 2)}%</Trans>
              </Text>{" "}
              of grade
            </Trans>
          </Text>
        </div>
        {!readOnly && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "5px",
            }}
          >
            <Tooltip content={t`Add criteria`}>
              <IconButton variant="soft" onClick={addNewCriteria}>
                <PlusIcon />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

const StyledLevelInput = styled(TextField.Root)`
  & > input {
    font-weight: bold;
  }
`;

export default Rubric;
