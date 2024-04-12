import { Divider, Radio, Space, Typography, message } from "antd";
import { Moment } from "moment";
import {
  extractSecondDuration,
  secondDurationToMoment,
} from "util/Time";
import React, { useEffect, useState } from "react";

import {
  UpdateAssignmentData,
} from "graphql/types";
import Modal from "components/common/Modal";
import { Tabs } from "components/common/Tabs";
import { Text } from "components/common/Text";
import { InputArea } from "components/common/Input";
import { Button } from "components/common/Button";
import { InputNumber } from "components/common/InputNumber";
import useDocumentStore from "context/ZustandDocumentStore";
import { TitleSettingSection } from "./common";
import TimePicker from "components/common/TimePickerWrapper";
import { Trans, t } from "@lingui/macro";
import AssignmentGradeSettingTab from "./AssignmentGradeSettingTab";

enum SettingTab {
  BasicSetting = "Basic",
  Grade = "Grade",
  Activation = "Activation",
  Tag = "Tag",
}

export type AssignmentSettingProps = {
  open: boolean;
  onClose: () => void;
};

const translateTab = (tab: SettingTab) => {
  switch (tab) {
    case SettingTab.Activation:
      return t`Activation`;
    case SettingTab.BasicSetting:
      return t`Basic`;
    case SettingTab.Grade:
      return t`Grade`;
    case SettingTab.Tag:
      return t`Tag`;
  }
};

const AssignmentSettingWrapper = (props: AssignmentSettingProps) => {
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  if (!activeDocument) return null;
  return <AssignmentSetting {...props} />;
};

const AssignmentSetting = ({ open, onClose }: AssignmentSettingProps) => {
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const updateAssignment = useDocumentStore((state) => state.updateAssignment);
  const assignment = activeDocument?.assignment;

  const castingUpdateData = (): UpdateAssignmentData => {
    return {
      gradeMethod: assignment?.gradeMethod,
      gradedType: assignment?.gradedType,
      bandScoreId: assignment?.bandScoreId,
      maxNumberOfAttempt: assignment?.maxNumberOfAttempt,
      preDescription: assignment?.preDescription || "",
      testDuration: assignment?.testDuration,
      forceAutoSubmit: true,
      allowSubmissionChangeStructure: assignment?.allowSubmissionChangeStructure,
      weightingIntoFinalGrade: assignment?.weightingIntoFinalGrade,
    };
  };

  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(SettingTab.BasicSetting);
  const [updateData, setUpdateData] = useState<UpdateAssignmentData>(
    castingUpdateData()
  );

  useEffect(() => {
    if (assignment) {
      setUpdateData(castingUpdateData());
    }
  }, [assignment]);

  const save = async () => {
    setLoading(true);
    await updateAssignment(updateData);
    message.success(t`Update assignment successfully`);
    setLoading(false);
  };

  const onChangeValue = (key: keyof UpdateAssignmentData) => (value: any) => {
    // @ts-ignore
    updateData[key] = value;
    setUpdateData({ ...updateData });
  };

  const onChangeTestDuration = (value?: Moment) => {
    if (value) {
      const testDuration = extractSecondDuration(value);
      onChangeValue("testDuration")(testDuration);
    } else {
      onChangeValue("testDuration")(undefined);
    }
  };

  const onChangeLimitNumber = (limit: boolean) => {
    if (limit) {
      onChangeValue("maxNumberOfAttempt")(1);
    } else {
      onChangeValue("maxNumberOfAttempt")(null);
    }
  };

  const testDuration = updateData.testDuration
    ? secondDurationToMoment(updateData.testDuration)
    : undefined;
  const limit = updateData.maxNumberOfAttempt !== null;

  
  return (
    <Modal visible={open} onClose={onClose} title={"Settings"} width={865}>
      <Tabs
        activeKey={activeKey}
        onChange={(v) => setActiveKey(v as SettingTab)}
        animated={false}
        items={[
          {
            key: SettingTab.BasicSetting,
            label: translateTab(SettingTab.BasicSetting),
            children: (
              <div>
                <TitleSettingSection>
                  <Trans>Description</Trans>
                </TitleSettingSection>
                <div>
                  <Text level={2}>
                    <Trans>Pre-Assignment Descriptions</Trans>
                  </Text>
                </div>
                <Typography.Text type="secondary">
                  <Trans>
                    Description will show before your students start the
                    submission
                  </Trans>
                </Typography.Text>
                <InputArea
                  placeholder={t`Type your assignment description`}
                  value={updateData.preDescription}
                  onChange={(e) =>
                    onChangeValue("preDescription")(e.currentTarget.value)
                  }
                />
                <Divider />
                <TitleSettingSection>
                  <Trans>Test Duration</Trans>
                </TitleSettingSection>
                <div>
                  <Typography.Text type="secondary">
                    <Trans>Hour : Minute : Second</Trans>
                  </Typography.Text>
                </div>
                <TimePicker
                  value={testDuration}
                  onChange={onChangeTestDuration}
                />
                <Divider />
                <TitleSettingSection>
                  <Trans>
                    Assignment type
                  </Trans>
                </TitleSettingSection>
                <Radio.Group
                  onChange={e => onChangeValue("allowSubmissionChangeStructure")(e.target.value)}
                  value={updateData.allowSubmissionChangeStructure}
                >
                  <Space direction="vertical">
                    <Radio value={false}>
                      <Trans>Structured Assignment</Trans><br/>
                      <Typography.Text type="secondary">
                        <Trans>Student will follow setup of teacher.</Trans>
                      </Typography.Text>
                    </Radio>
                    <Radio value={true}>
                      <Trans>Open Assignment</Trans><br/>
                      <Typography.Text type="secondary">
                        <Trans>Student can do anything, included setup of teacher.</Trans>
                      </Typography.Text>
                    </Radio>
                  </Space>
                </Radio.Group>
                <Divider />
                <TitleSettingSection>
                  <Trans>
                    Limit the number of times to take the assignment
                  </Trans>
                </TitleSettingSection>
                <Radio.Group
                  value={limit}
                  onChange={(e) => onChangeLimitNumber(e.target.value)}
                >
                  <Space direction="vertical">
                    <Radio value={false}>
                      <Trans>No limit</Trans>
                    </Radio>
                    <Radio value={true}>
                      <Trans>Limit</Trans>
                    </Radio>
                  </Space>
                </Radio.Group>
                <div>
                  {limit && (
                    <InputNumber
                      style={{ marginTop: "5px", maxWidth: "261px" }}
                      placeholder={t`Type the limitation number`}
                      value={updateData.maxNumberOfAttempt}
                      onChange={onChangeValue("maxNumberOfAttempt")}
                    />
                  )}
                </div>
              </div>
            ),
          },
          {
            key: SettingTab.Grade,
            label: translateTab(SettingTab.Grade),
            children: <AssignmentGradeSettingTab
              updateData={updateData}
              rubric={assignment?.rubric}
              onChangeValue={onChangeValue}
            />,
          },
        ]}
      />
      <Divider />
      <Button
        type={"primary"}
        style={{ float: "right" }}
        onClick={save}
        loading={loading}
        disabled={loading}
      >
        <Trans>Save</Trans>
      </Button>
    </Modal>
  );
};

export default AssignmentSettingWrapper;
