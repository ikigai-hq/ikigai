import React from "react";
import { Trans } from "@lingui/macro";
import styled from "styled-components";
import { Button, Heading, Separator } from "@radix-ui/themes";
import { Pencil2Icon } from "@radix-ui/react-icons";

import LearningModuleDnd from "components/common/LearningModuleDnd";
import LessonItemDnd from "components/common/LearningModuleDnd/LessonItemDnd";
import useDocumentStore from "store/DocumentStore";
import usePermission from "hook/UsePermission";
import { DocumentType, SpaceActionPermission } from "graphql/types";
import CreateContentButton from "components/common/LearningModuleDnd/CreateContentButton";
import {
  LeftSideContainer,
  LeftSideContentWrapper,
  LeftSideHeaderWrapper,
} from "./shared";

const SpaceDocumentList = () => {
  const allow = usePermission();
  const spaceDocuments = useDocumentStore((state) =>
    state.spaceDocuments.filter(
      (spaceDocument) => spaceDocument.documentType !== DocumentType.SUBMISSION,
    ),
  );
  const canAddContent = allow(SpaceActionPermission.MANAGE_SPACE_CONTENT);

  return (
    <LeftSideContainer>
      <LeftSideHeaderWrapper>
        <div style={{ flex: 1, paddingLeft: 5 }}>
          <Heading size="5">
            <Trans>Content</Trans>
          </Heading>
        </div>
        {canAddContent && (
          <CreateContentButton parentId={null}>
            <Button variant="soft">
              <Pencil2Icon /> <Trans>Add Content</Trans>
            </Button>
          </CreateContentButton>
        )}
      </LeftSideHeaderWrapper>
      <Separator style={{ width: "100%" }} />
      <LeftSideContentWrapper>
        <LearningModuleDnd
          docs={spaceDocuments}
          keyword={""}
          TreeItemComponent={LessonItemDnd}
          defaultCollapsed={true}
          parentId={null}
        />
      </LeftSideContentWrapper>
    </LeftSideContainer>
  );
};

export default SpaceDocumentList;
