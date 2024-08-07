import { Trans } from "@lingui/macro";
import React from "react";
import { Button, Separator } from "@radix-ui/themes";
import { Pencil2Icon } from "@radix-ui/react-icons";

import LessonItemDnd from "components/common/LearningModuleDnd/LessonItemDnd";
import LearningModuleDnd from "components/common/LearningModuleDnd";
import useDocumentStore from "store/DocumentStore";
import {
  GetDocuments_spaceGet_documents as ISpaceDocument,
  SpaceActionPermission,
} from "graphql/types";
import CreateContentButton from "components/common/LearningModuleDnd/CreateContentButton";
import usePermission from "hook/UsePermission";

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
  const allow = usePermission();
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const spaceDocuments = useDocumentStore((state) => state.spaceDocuments);

  const subDocuments = getChildrenSpaceDocuments(
    spaceDocuments,
    activeDocumentId,
  );
  return (
    <div>
      {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
        <CreateContentButton parentId={activeDocumentId}>
          <Button size="1" variant="soft">
            <Pencil2Icon /> <Trans>Add Content</Trans>
          </Button>
        </CreateContentButton>
      )}
      <Separator style={{ width: "100%", marginTop: 15, marginBottom: 15 }} />
      <LearningModuleDnd
        docs={subDocuments}
        keyword={""}
        TreeItemComponent={LessonItemDnd}
        defaultCollapsed={true}
        parentId={activeDocumentId}
      />
    </div>
  );
};

export default FolderCoverPageBody;
