import { t } from "@lingui/macro";
import { Tabs } from "antd";
import { IconFileInfo, IconPencil } from "@tabler/icons-react";
import React from "react";

import TabPanelHeaderWrapper from "../TabPannelHeaderWrapper";
import GeneralInformation from "./GeneralInformation";
import GradeInformation from "./GradeInformation";
import useAuthUserStore from "store/AuthStore";
import { Role } from "graphql/types";
import StudentExtraActions from "./StudentExtraActions";

const AssignmentCoverPageBody = () => {
  const isStudent = useAuthUserStore((state) => state.role === Role.STUDENT);
  return (
    <Tabs
      style={{ flex: 1 }}
      tabBarExtraContent={isStudent ? <StudentExtraActions /> : undefined}
    >
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
        tab={
          <TabPanelHeaderWrapper
            icon={<IconPencil />}
            text={t`Grade Information`}
          />
        }
      >
        <GradeInformation />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default AssignmentCoverPageBody;
