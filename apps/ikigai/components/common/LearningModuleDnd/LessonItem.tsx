import React, { useRef } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { Text } from "@radix-ui/themes";

import { LearningItemType } from "components/common/LearningModuleDnd/types";
import { formatDocumentRoute } from "config/Routes";
import useDocumentStore from "store/DocumentStore";
import { DocumentType } from "graphql/types";
import { documentIcon } from "util/DocumentUtil";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import LessonItemRightInformation from "./LessonItemRightInformation";

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
  onChangeCollapsed,
  collapsed,
}: DocumentItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const documentTitle = useDocumentStore(
    (state) =>
      state.spaceDocuments.find((spaceDoc) => spaceDoc.id === item.id)?.title,
  );
  const isFolder = item.documentType === DocumentType.FOLDER;
  const fileIcon = documentIcon(item);

  const onClickCollapse = (e) => {
    e.stopPropagation();
    if (onChangeCollapsed && isFolder) onChangeCollapsed();
  };
  const icon = !collapsed ? (
    <ChevronDownIcon onClick={onClickCollapse} />
  ) : (
    <ChevronRightIcon onClick={onClickCollapse} />
  );

  const active = router.query.documentId === item.id;
  return (
    <Link href={formatDocumentRoute(item.id)} passHref>
      <LessonItemContainer ref={ref} $active={active}>
        <div style={{ marginTop: 5 }}>{isFolder && icon}</div>
        <span style={{ display: "flex", fontSize: 18 }}>{fileIcon}</span>
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ flex: "1", display: "inline-grid" }}>
            {item.parentId ? (
              <Text truncate size="3">
                {documentTitle || DEFAULT_DOCUMENT_TITLE}
              </Text>
            ) : (
              <Text truncate size="3">
                {documentTitle || DEFAULT_DOCUMENT_TITLE}
              </Text>
            )}
          </div>
        </div>
        <LessonItemRightInformation item={item} />
      </LessonItemContainer>
    </Link>
  );
};

const LessonItemContainer = styled.div<{
  $active?: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 2px 0 5px;
  height: 35px;
  gap: 8px;
  cursor: pointer;
  background-color: ${(props) => {
    if (props.$active) {
      return "var(--gray-4)";
    }
    return "unset";
  }};
  border-radius: 8px;

  &:hover {
    background-color: var(--gray-3);
  }
`;

export default LessonItem;
