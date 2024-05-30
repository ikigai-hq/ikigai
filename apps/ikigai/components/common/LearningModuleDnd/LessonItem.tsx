import React, { useRef } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { Text } from "@radix-ui/themes";
import { DotsVerticalIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";

import { LearningItemType } from "components/common/LearningModuleDnd/types";
import { formatDocumentRoute } from "config/Routes";
import { ActionMenuDropdown } from "components/common/ActionMenuDropdown";
import useDocumentStore from "store/DocumentStore";
import usePermission from "hook/UsePermission";
import { DocumentType, SpaceActionPermission } from "graphql/types";
import CreateContentButton from "./CreateContentButton";
import { ArrowDocument } from "../IconSvg";

export const DEFAULT_DOCUMENT_TITLE = "Untitled";

export type DocumentItemProps = {
  item: LearningItemType;
  dragging: boolean;
  collapsed?: boolean;
  onChangeCollapsed?: () => void;
  hasChildren: boolean;
  bigSize?: boolean;
};

const LessonItem = ({
  item,
  dragging,
  onChangeCollapsed,
  collapsed,
}: DocumentItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const allow = usePermission();

  const documentTitle = useDocumentStore(
    (state) =>
      state.spaceDocuments.find((spaceDoc) => spaceDoc.id === item.id)?.title,
  );
  const isFolder = item.documentType === DocumentType.FOLDER;
  const fileIcon = isFolder ? "📁" : "📝";

  const onClickCollapse = (e) => {
    e.stopPropagation();
    if (onChangeCollapsed && isFolder) onChangeCollapsed();
  };
  const icon = (
    <ArrowDocument
      style={{ transform: `rotate(${collapsed ? 180 : 270}deg)` }}
      onClick={onClickCollapse}
    />
  );

  const active = router.query.documentId === item.id;
  return (
    <Link href={formatDocumentRoute(item.id)} passHref>
      <LessonItemContainer ref={ref} $active={active}>
        <div style={{ marginTop: 5 }}>{isFolder && icon}</div>
        <span style={{ display: "flex" }}>{fileIcon}</span>
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ flex: "1", display: "inline-grid" }}>
            {item.parentId ? (
              <Text truncate size="2">
                {documentTitle || DEFAULT_DOCUMENT_TITLE}
              </Text>
            ) : (
              <Text truncate size="2">
                {documentTitle || DEFAULT_DOCUMENT_TITLE}
              </Text>
            )}
          </div>
          {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && !dragging && (
            <ButtonGroup>
              <ActionMenuDropdown
                item={item}
                menuList={[]}
                hasPermission={true}
              >
                <IconButton
                  style={{ cursor: "pointer" }}
                  size="2"
                  variant="ghost"
                  color="gray"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DotsVerticalIcon />
                </IconButton>
              </ActionMenuDropdown>
              {isFolder && (
                <CreateContentButton parentId={item.id}>
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
            </ButtonGroup>
          )}
        </div>
      </LessonItemContainer>
    </Link>
  );
};

const ButtonGroup = styled.div`
  display: none;
  padding: 0 5px;
`;

const LessonItemContainer = styled.div<{
  $active?: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 2px 0 5px;
  height: 28px;
  gap: 8px;
  cursor: pointer;
  background-color: ${(props) => {
    if (props.$active) {
      return props.theme.colors.gray[2];
    }
    return "unset";
  }};
  border-radius: 8px;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray[2]};
    ${ButtonGroup} {
      display: flex;
    }
  }
`;

export default LessonItem;
