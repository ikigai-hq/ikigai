import React, { useRef, useState } from "react";
import styled, { useTheme } from "styled-components";
import {
  ExclamationCircleFilled,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Link from "next/link";

import useUserPermission from "hook/UseUserPermission";
import { Permission } from "util/permission";
import { LearningItemType } from "components/common/LearningModuleDnd/types";
import { TextButtonWithHover } from "components/common/Button";
import { formatDocumentRoute } from "config/Routes";
import useClassStore from "context/ZustandClassStore";
import {
  ActionMenuDropdown,
  IMenuItem,
} from "../../common/ActionMenuDropdown";
import CreateContentButton from "./CreateContentButton";
import useDocumentStore from "context/ZustandDocumentStore";
import DocumentTypeIcon from "../DocumentTypeIcon";
import { DEFAULT_DOCUMENT_TITLE } from "../common";
import { t } from "@lingui/macro";
import { ArrowDocument } from "components/common/IconSvg";
import { useModal } from "hook/UseModal";
import usePageBlockStore from "context/ZustandPageBlockStore";
import useQuizStore from "context/ZustandQuizStore";
import useHighlightStore from "context/ZustandHighlightStore";
import useEditorActionStore from "context/ZustandEditorAction";
import CopyDocumentToClass from "./CopyDocumentToClass";

export type DocumentItemProps = {
  item: LearningItemType;
  dragging: boolean;
  collapsed?: boolean;
  onChangeCollapsed?: () => void;
  hasChildren: boolean;
};

const LessonItem = ({
  collapsed,
  item,
  dragging,
  onChangeCollapsed,
  hasChildren,
}: DocumentItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const router = useRouter();
  const allow = useUserPermission();
  const { modal } = useModal();

  const [selectedMoveDocumentId, setSelectedMoveDocumentId] = useState<
    string | undefined
  >();
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const changeRightPanel = useDocumentStore((state) => state.changeRightPanel);
  const { duplicateDocument, deleteDocument, docs } = useClassStore((state) => {
    return {
      duplicateDocument: state.duplicateDocument,
      deleteDocument: state.deleteDocument,
      docs: state.documents,
    };
  });

  const onDuplicate = async (item: LearningItemType) => {
    const res = await duplicateDocument(item.id);
    if (res) {
      toast.success(t`Duplicated!`);
    }
  };

  const onDelete = async (item: LearningItemType) => {
    const res = await deleteDocument(item.id);
    if (res) {
      toast.success(t`Deleted!`);
      // This document was deleted
      if (res.includes(activeDocument.id)) {
        // Found the first non deleted one
        const otherDoc = [...docs]
          .sort((a, b) => a.document.index - b.document.index)
          .find(
            (doc) =>
              !doc.document.deletedAt &&
              !doc.document.parentId &&
              doc.documentId !== item.id
          );
        if (otherDoc) {
          router.push(formatDocumentRoute(otherDoc.documentId), undefined, {
            shallow: true,
          });
          return;
        }

        router.push("/");
      }
    }
  };

  const onClickCollapse = (e: MouseEvent) => {
    e.stopPropagation();
    if (onChangeCollapsed) onChangeCollapsed();
  };

  const onClickDocument = () => {
    usePageBlockStore.setState({ mapPageBlockData: new Map() });
    useDocumentStore.setState({ mapAvailableDocument: new Map() });
    useQuizStore.setState({ mapQuizBlockData: new Map() });
    useHighlightStore.setState({ highlights: new Map(), threads: new Map() });
    usePageBlockStore.setState({ pageBlocks: [], mapPageBlockData: new Map() });
    useEditorActionStore.setState({ mapEditorAction: new Map() });
    changeRightPanel(undefined);
  };

  const menuList: IMenuItem<LearningItemType>[] = [
    {
      title: t`Duplicate`,
      hide: !allow(Permission.ManageClassContent),
      callback: (item: LearningItemType) => {
        onDuplicate(item);
      },
    },
    {
      title: t`Copy to class`,
      callback: (item: LearningItemType) => {
        setSelectedMoveDocumentId(item.id);
      },
      hide: !allow(Permission.ManageClassContent),
    },
    {
      title: t`Delete`,
      color: theme.colors.red[4],
      hide: !allow(Permission.ManageClassContent),
      callback: (item: LearningItemType) => {
        modal.confirm({
          title: t`Are you sure you want to delete this ?`,
          icon: <ExclamationCircleFilled />,
          content: t`This action cannot be undone. Once you delete this, 
            you will lose all the content and settings associated with it.`,
          okText: `Yes, delete this`,
          okType: "danger",
          cancelText: t`Cancel`,
          onOk() {
            onDelete(item);
          },
          okButtonProps: {
            type: "primary",
          },
          bodyStyle: {
            padding: "32px 32px 24px 32px",
          },
        });
      },
    },
  ];

  const active = router.query.documentId === item.id;
  let icon = !hasChildren ? (
    <MinusDocument />
  ) : (
    <ArrowDocument
      style={{ transform: `rotate(${collapsed ? 180 : 270}deg)` }}
      onClick={onClickCollapse}
    />
  );

  return (
    <Link href={formatDocumentRoute(item.id)} passHref>
      <LessonItemContainer onClick={onClickDocument} ref={ref} $active={active}>
        {icon}
        <span onClick={onClickDocument} style={{ display: "flex" }}>
          <DocumentTypeIcon documentType={item.documentType} />
        </span>
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ flex: "1", display: "inline-grid" }}>
            {item.parentId ? (
              <StyledText ellipsis $active={active}>
                {item.title || DEFAULT_DOCUMENT_TITLE}
              </StyledText>
            ) : (
              <StyledText ellipsis onClick={onClickDocument}>
                {item.title || DEFAULT_DOCUMENT_TITLE}
              </StyledText>
            )}
          </div>
          {allow(Permission.ManageClassContent) && !dragging && (
            <ButtonGroup>
              <ActionMenuDropdown
                item={item}
                menuList={menuList}
                hasPermission={true}
              >
                <StyledButton
                  icon={<MoreOutlined />}
                  type="text"
                  size={"small"}
                  onClick={(e) => e.stopPropagation()}
                />
              </ActionMenuDropdown>
              <CreateContentButton parentId={item.id}>
                <StyledButton
                  icon={<PlusOutlined />}
                  type="text"
                  size={"small"}
                  onClick={(e) => e.stopPropagation()}
                />
              </CreateContentButton>
            </ButtonGroup>
          )}
        </div>
        {!!selectedMoveDocumentId && (
          <CopyDocumentToClass
            selectedDocumentId={selectedMoveDocumentId}
            visible={!!selectedMoveDocumentId}
            onClose={() => setSelectedMoveDocumentId(undefined)}
          />
        )}
      </LessonItemContainer>
    </Link>
  );
};

const StyledText = styled(Typography.Text)<{
  $active?: boolean;
  $weight?: number;
}>`
  color: ${(props) => props.theme.colors.gray[9]};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: ${(props) => props.$weight || 500};
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
  $editing?: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 5px 0 10px;
  height: 38px;
  gap: 8px;
  cursor: pointer;
  background-color: ${(props) => {
    if (props.$editing) {
      return props.theme.colors.gray[0];
    }
    if (props.$active) {
      return props.theme.colors.gray[2];
    }
    return "unset";
  }};
  box-shadow: ${(props) => {
    if (props.$editing) {
      return `
        0px 9px 28px 8px rgba(0, 0, 0, 0.05), 
        0px 3px 6px -4px rgba(0, 0, 0, 0.12), 
        0px 6px 16px 0px rgba(0, 0, 0, 0.08)
      `;
    }
  }};
  border-radius: 8px;

  &:hover {
    background-color: ${(props) =>
      props.theme.colors.gray[props.$editing ? 0 : 2]};
    ${ButtonGroup} {
      display: flex;
    }
  }
`;

const MinusDocument = styled.div`
  width: 20px;
  height: 20px;
  position: relative;

  &::before {
    content: "";
    width: 6px;
    height: 0.5px;
    background: #272f3e;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
`;

export default LessonItem;