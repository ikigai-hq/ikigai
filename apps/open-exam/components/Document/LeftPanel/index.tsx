import React from "react";
import shallow from "zustand/shallow";
import { useQuery } from "@apollo/client";
import { Tooltip } from "antd";

import useDocumentStore from "context/ZustandDocumentStore";
import useUserPermission from "hook/UseUserPermission";
import {
  GetBasicClassDetail,
  GetDocuments_classGet_classDocuments,
} from "graphql/types";
import { Text, TextWeight } from "components/common/Text";
import { useTheme } from "styled-components";
import useClassStore from "context/ZustandClassStore";
import { Permission } from "util/permission";
import { GET_BASIC_CLASS_DETAIL } from "graphql/query/ClassQuery";
import { handleError } from "graphql/ApolloClient";
import CreateContentButton from "./CreateContentButton";
import { ListModule, TitlePanel, ClassInfo } from "./common";
import { RightBodyContainer } from "../common";
import LearningModuleDnd from "components/common/LearningModuleDnd";
import LessonItemDnd from "./LessonItemDnd";

interface Props {
  docs: GetDocuments_classGet_classDocuments[];
}

const LeftPanel: React.FC<Props> = ({ docs }) => {
  const theme = useTheme();
  const allow = useUserPermission();
  const { leftPanelHidden } = useDocumentStore(
    ({ leftPanelHidden, createDocument, masterDocument }) => ({
      leftPanelHidden,
      createDocument,
      masterDocument,
    }),
    shallow,
  );
  const { classId } = useClassStore((state) => {
    return {
      classId: state.classId,
      currentClass: state.currentClass,
      refetchDocuments: state.fetchAndSetDocuments,
      setAsLesson: state.addClassDocument,
      documents: state.documents,
    };
  }, shallow);
  const { data: basicClassDetailRes } = useQuery<GetBasicClassDetail>(
    GET_BASIC_CLASS_DETAIL,
    {
      skip: !classId,
      onError: handleError,
      variables: {
        classId,
      },
      fetchPolicy: "cache-first",
    },
  );

  return (
    <RightBodyContainer $hide={leftPanelHidden} $leftPanel={true}>
      <div style={{ width: "100%" }}>
        <ClassInfo
          imgUrl={basicClassDetailRes?.classGet?.banner?.publicUrl}
          title={basicClassDetailRes?.classGet?.name}
        />
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
