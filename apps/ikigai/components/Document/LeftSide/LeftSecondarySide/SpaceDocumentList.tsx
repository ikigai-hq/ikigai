import React from "react";
import { Trans } from "@lingui/macro";
import styled from "styled-components";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { IconButton, Heading, Separator } from "@radix-ui/themes";

import LearningModuleDnd from "components/common/LearningModuleDnd";
import LessonItemDnd from "components/common/LearningModuleDnd/LessonItemDnd";
import useDocumentStore from "store/DocumentStore";
import CreateContentButton from "components/common/LearningModuleDnd/CreateContentButton";
import usePermission from "hook/UsePermission";
import { DocumentType, SpaceActionPermission } from "graphql/types";

const SpaceDocumentList = () => {
  const allow = usePermission();
  const spaceDocuments = useDocumentStore((state) =>
    state.spaceDocuments.filter(
      (spaceDocument) => spaceDocument.documentType !== DocumentType.SUBMISSION,
    ),
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "50px",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <div style={{ flex: 1, paddingLeft: 5 }}>
          <Heading size="3">
            <Trans>Content</Trans>
          </Heading>
        </div>
        {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
          <CreateContentButton parentId={null}>
            <IconButton
              style={{ cursor: "pointer" }}
              size="2"
              variant="ghost"
              color="gray"
              onClick={(e) => e.stopPropagation()}
            >
              <Pencil2Icon />
            </IconButton>
          </CreateContentButton>
        )}
      </div>
      <Separator style={{ width: "100%" }} />
      <ListModule>
        <LearningModuleDnd
          docs={spaceDocuments}
          keyword={""}
          TreeItemComponent={LessonItemDnd}
          defaultCollapsed={true}
          parentId={null}
        />
      </ListModule>
    </div>
  );
};

export default SpaceDocumentList;

const ListModule = styled.div`
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  padding: 5px;
`;
