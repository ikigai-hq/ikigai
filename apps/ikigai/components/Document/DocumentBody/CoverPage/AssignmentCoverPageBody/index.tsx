import { t } from "@lingui/macro";
import { Tabs } from "antd";
import { IconFileInfo } from "@tabler/icons-react";
import React from "react";

import TabPanelHeaderWrapper from "../TabPannelHeaderWrapper";
import GeneralInformation from "./GeneralInformation";

const AssignmentCoverPageBody = () => {
  return (
    <Tabs style={{ flex: 1 }}>
      <Tabs.TabPane
        tabKey="Settings"
        tab={
          <TabPanelHeaderWrapper icon={<IconFileInfo />} text={t`General`} />
        }
      >
        <GeneralInformation />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default AssignmentCoverPageBody;
