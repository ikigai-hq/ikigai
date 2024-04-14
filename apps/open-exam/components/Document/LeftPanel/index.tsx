import React from "react";
import shallow from "zustand/shallow";
import { Tooltip } from "antd";

import useDocumentStore from "context/ZustandDocumentStore";
import useUserPermission from "hook/UseUserPermission";
import {
  GetDocuments_spaceGet_documents,
} from "graphql/types";
import { Text, TextWeight } from "components/common/Text";
import { useTheme } from "styled-components";
import { Permission } from "util/permission";
import CreateContentButton from "./CreateContentButton";
import { ListModule, TitlePanel } from "./common";
import { RightBodyContainer } from "../common";
import LearningModuleDnd from "components/common/LearningModuleDnd";
import LessonItemDnd from "./LessonItemDnd";

interface Props {
  docs: GetDocuments_spaceGet_documents[];
}

const LeftPanel: React.FC<Props> = ({ docs }) => {
  const theme = useTheme();
  const allow = useUserPermission();
  const { leftPanelHidden } = useDocumentStore(
    ({ leftPanelHidden, masterDocument }) => ({
      leftPanelHidden,
      masterDocument,
    }),
    shallow,
  );
  
  return (
    <RightBodyContainer $hide={leftPanelHidden} $leftPanel={true}>
      <div style={{ width: "100%" }}>
        {allow(Permission.ManageClassContent) && (
          <TitlePanel>
            <Text
              color={theme.colors.gray[6]}
              weight={TextWeight.medium}
              level={2}
            >
              Material
            </Text>
            <Tooltip
              trigger="hover"
              placement="bottom"
              title={
                <Text level={2} color={theme.colors.gray[0]}>
                  New Module
                </Text>
              }
            >
              <CreateContentButton parentId={null} onlyIcon={true} />
            </Tooltip>
          </TitlePanel>
        )}
        <ListModule style={{ height: "80%", overflow: "auto" }}>
          {docs && (
            <LearningModuleDnd
              docs={docs}
              keyword={""}
              TreeItemComponent={LessonItemDnd}
              defaultCollapsed={true}
            />
          )}
        </ListModule>
      </div>
    </RightBodyContainer>
  );
};

export default LeftPanel;
