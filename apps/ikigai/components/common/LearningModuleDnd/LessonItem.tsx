import React, { useRef } from "react";
import styled from "styled-components";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useRouter } from "next/router";
import Link from "next/link";

import { LearningItemType } from "components/common/LearningModuleDnd/types";
import { TextButtonWithHover } from "components/common/Button";
import { formatDocumentRoute } from "config/Routes";
import { ActionMenuDropdown } from "components/common/ActionMenuDropdown";
import useDocumentStore from "context/DocumentV2Store";
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
  const documentIconValue = useDocumentStore(
    (state) =>
      state.spaceDocuments.find((spaceDoc) => spaceDoc.id === item.id)
        ?.iconValue || "✏️",
  );
  const isFolder = item.documentType === DocumentType.FOLDER;

  const onClickCollapse = () => {
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
        {!isFolder && (
          <span style={{ display: "flex" }}>{documentIconValue}</span>
        )}
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ flex: "1", display: "inline-grid" }}>
            {item.parentId ? (
              <StyledText ellipsis $active={active} $isFolder={isFolder}>
                {documentTitle || DEFAULT_DOCUMENT_TITLE}
              </StyledText>
            ) : (
              <StyledText ellipsis $isFolder={isFolder}>
                {documentTitle || DEFAULT_DOCUMENT_TITLE}
              </StyledText>
            )}
          </div>
          {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && !dragging && (
            <ButtonGroup>
              <ActionMenuDropdown
                item={item}
                menuList={[]}
                hasPermission={true}
              >
                <StyledButton
                  icon={<MoreOutlined />}
                  type="text"
                  size={"small"}
                  onClick={(e) => e.stopPropagation()}
                />
              </ActionMenuDropdown>
              {isFolder && (
                <CreateContentButton parentId={item.id}>
                  <StyledButton
                    icon={<PlusOutlined />}
                    type="text"
                    size={"small"}
                    onClick={(e) => e.stopPropagation()}
                  />
                </CreateContentButton>
              )}
            </ButtonGroup>
          )}
        </div>
      </LessonItemContainer>
    </Link>
  );
};

const StyledText = styled(Typography.Text)<{
  $active?: boolean;
  $weight?: number;
  $isFolder?: boolean;
}>`
  color: ${(props) => props.theme.colors.gray[7]};
  font-family: Inter, serif;
  font-size: 13px;
  font-style: normal;
  font-weight: ${(props) => (props.$isFolder ? 500 : 400)};
  line-height: normal;
  letter-spacing: -0.014px;
`;

const StyledButton = styled(TextButtonWithHover)`
  margin: unset;
  color: #888e9c;
`;

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
