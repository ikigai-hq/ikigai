import { t, Trans } from "@lingui/macro";
import { Tabs, Typography } from "antd";
import { IconFilePlus, IconFolders } from "@tabler/icons-react";
import React from "react";
import { useTheme } from "styled-components";

import LessonItemDnd from "components/common/LearningModuleDnd/LessonItemDnd";
import LearningModuleDnd from "components/common/LearningModuleDnd";
import useDocumentStore from "context/DocumentStore";
import { GetDocuments_spaceGet_documents as ISpaceDocument } from "graphql/types";
import { TextButtonWithHover } from "components/common/Button";
import CreateContentButton from "components/common/LearningModuleDnd/CreateContentButton";
import Spacer from "components/common/Spacer";

const getChildrenSpaceDocuments = (
  spaceDocuments: ISpaceDocument[],
  parentId?: string,
): ISpaceDocument[] => {
  const res: ISpaceDocument[] = [];
  const childrenSpaceDocuments = spaceDocuments.filter(
    (doc) => doc.parentId === parentId,
  );
  res.push(...childrenSpaceDocuments);

  childrenSpaceDocuments.forEach((childrenSpaceDocument) => {
    res.push(
      ...getChildrenSpaceDocuments(spaceDocuments, childrenSpaceDocument.id),
    );
  });

  return res;
};

const FolderCoverPageBody = () => {
  const theme = useTheme();
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const spaceDocuments = useDocumentStore((state) => state.spaceDocuments);

  const subDocuments = getChildrenSpaceDocuments(
    spaceDocuments,
    activeDocumentId,
  );
  return (
    <Tabs>
      <Tabs.TabPane
        key="sub-contents"
        tab={t`Sub Contents`}
        icon={<IconFolders size={14} />}
      >
        <CreateContentButton parentId={activeDocumentId}>
          <TextButtonWithHover
            icon={
              <IconFilePlus size={18} stroke={2} color={theme.colors.gray[6]} />
            }
            type="text"
          >
            <Typography.Text strong type="secondary">
              <Trans>Add sub content</Trans>
            </Typography.Text>
          </TextButtonWithHover>
        </CreateContentButton>
        <Spacer />
        <LearningModuleDnd
          docs={subDocuments}
          keyword={""}
          TreeItemComponent={LessonItemDnd}
          defaultCollapsed={true}
          parentId={activeDocumentId}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default FolderCoverPageBody;
