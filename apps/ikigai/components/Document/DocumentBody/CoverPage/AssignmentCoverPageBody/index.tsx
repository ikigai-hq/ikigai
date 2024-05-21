import { t } from "@lingui/macro";
import { Tabs } from "antd";
import { IconFileInfo, IconPencil } from "@tabler/icons-react";
import React from "react";

import TabPanelHeaderWrapper from "../TabPannelHeaderWrapper";
import GeneralInformation from "./GeneralInformation";
import GradeInformation from "./GradeInformation";

const AssignmentCoverPageBody = () => {
  return (
    <Tabs style={{ flex: 1 }}>
      <Tabs.TabPane
        key="General"
        tabKey="General"
        tab={
          <TabPanelHeaderWrapper icon={<IconFileInfo />} text={t`General`} />
        }
      >
        <GeneralInformation />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="Grade"
        tabKey="Grade"
        tab={<TabPanelHeaderWrapper icon={<IconPencil />} text={t`Grade`} />}
      >
        <GradeInformation />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default AssignmentCoverPageBody;
