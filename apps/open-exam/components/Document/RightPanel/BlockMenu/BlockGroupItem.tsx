import { Text, TextWeight } from "components/common/Text";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { IMappingBlockGroupItemValue } from "./defaultMenu.config";
import { BlockItem } from "./BlockItem";
import useEditorActionStore from "context/ZustandEditorAction";
import { Trans } from "@lingui/macro";
import { ExtensionName } from "@openexam/editor/dist/types/extensions.enum";
import {
  useBoundingClientRect,
  AdvancedClientRect,
} from "@openexam/editor/dist/hooks/useBoundingClientRect";
import { EmbedBlockMenu } from "@openexam/editor/dist/components/embedBlockMenu/EmbedBlockMenu";
import { TableList } from "@openexam/editor/dist/components/common/TableList";
import useHandleClickOutside from "hook/UseHandleClickOutside";
import { capitalize } from "lodash";
import { ArrowDocument } from "components/common/IconSvg";

interface Props {
  groupName: string;
  icon: React.ReactNode;
  nestedMenu: IMappingBlockGroupItemValue[];
  autoExpand?: boolean;
}

export const BlockGroupItem: React.FC<Props> = ({
  autoExpand = false,
  groupName,
  icon,
  nestedMenu,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    mapEditorAction,
    activeDocumentEditorId,
    currentPointingDocumentId,
    currentPointingEditorState,
  } = useEditorActionStore(
    ({
      mapEditorAction,
      activeDocumentEditorId,
      currentPointingDocumentId,
      currentPointingEditorState,
    }) => ({
      mapEditorAction,
      activeDocumentEditorId,
      currentPointingDocumentId,
      currentPointingEditorState,
    }),
  );

  const activeEditorAction = mapEditorAction.get(activeDocumentEditorId);

  const editorView = activeEditorAction?.editorView;
  const editorState =
    currentPointingDocumentId === activeDocumentEditorId
      ? currentPointingEditorState
      : null;
  const commands = activeEditorAction?.commands;

  const [collapsed, setCollapsed] = useState(true);
  const [isOpenEmbedBlock, setIsOpenEmbedBlock] = useState(false);
  const [innerHeight, setInnerHeight] = useState(0);
  const [menuHeight, setMenuHeight] = useState(0);

  const virtualReference = useBoundingClientRect(
    editorView,
    editorState,
    isOpenEmbedBlock,
  );

  useHandleClickOutside(ref, () => setIsOpenEmbedBlock(false));

  useEffect(() => {
    setInnerHeight(window.innerHeight);
    if (isOpenEmbedBlock) {
      const el = document.getElementById("OPENEXAM_EMBED_BLOCK");
      el && setMenuHeight(el.offsetHeight);
    }
  }, [isOpenEmbedBlock]);

  useEffect(() => {
    setCollapsed(!autoExpand);
  }, [autoExpand]);

  const handleTriggerBlockMenu = (
    value: IMappingBlockGroupItemValue,
    customAttrs?: Record<string, any>,
  ) => {
    if (commands) {
      const command = commands[value.extensionName];

      if (value.extensionName === ExtensionName.CommonEmbed)
        return setIsOpenEmbedBlock(true);

      if (value.extensionName === ExtensionName.Table) {
        value.attrs = customAttrs;
      }

      if (command) {
        command(value?.attrs);
      } else {
        commands[`create${capitalize(value.extensionName)}`](value?.attrs);
      }
    }
  };

  return (
    <BlockGroupItemWrapper>
      <BlockGroupHead
        onClick={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
      >
        <div>
          {icon}
          <Text weight={TextWeight.medium} level={2}>
            <Trans>{groupName}</Trans>
          </Text>
        </div>
        <ArrowDocument
          style={{ transform: `rotate(${collapsed ? -90 : 90}deg)` }}
        />
      </BlockGroupHead>
      <NestedList collapsed={collapsed}>
        {nestedMenu?.map((nm) => {
          if (nm.extensionName === ExtensionName.Table) {
            return (
              <TableList
                key={nm.name}
                onCreateTable={(attrs) => handleTriggerBlockMenu(nm, attrs)}
              />
            );
          }

          return (
            <BlockItem
              triggerBlockMenu={() => handleTriggerBlockMenu(nm)}
              key={nm.name}
              name={nm.name}
              icon={nm.icon}
              shortcut={nm.shortcut}
            />
          );
        })}
      </NestedList>
      {isOpenEmbedBlock &&
        createPortal(
          <EmbedBlockContainer
            ref={ref}
            id="OPENEXAM_EMBED_BLOCK"
            $visible={isOpenEmbedBlock}
            $innerDocHeight={innerHeight}
            $coordinates={virtualReference}
            $menuHeight={menuHeight}
          >
            <EmbedBlockMenu
              view={editorView}
              triggerEmbedBlock={(value: string) => {
                commands[ExtensionName.CommonEmbed || ""]({ href: value });
                setIsOpenEmbedBlock(false);
              }}
            />
          </EmbedBlockContainer>,
          document.body,
        )}
    </BlockGroupItemWrapper>
  );
};

export const EmbedBlockContainer = styled.div<{
  $coordinates?: AdvancedClientRect;
  $visible: boolean;
  $innerDocHeight?: number;
  $menuHeight?: number;
}>`
  position: absolute;
  top: ${({ $coordinates, $innerDocHeight, $menuHeight }) => {
    if ($coordinates) {
      const { top, height } = $coordinates;
      return top + height >= Math.round($innerDocHeight / 2)
        ? top + height - $menuHeight - 24
        : top + height;
    }
    return 0;
  }}px;
  left: ${({ $coordinates }) => ($coordinates ? $coordinates.left : 0)}px;
  display: ${({ $visible }) => ($visible ? "block" : "none")};
  z-index: 9999999;
  width: 100%;
  max-width: 400px;
  padding: 12px;
  border-radius: 12px;
  background-color: #ffff;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px 0px rgba(0, 0, 0, 0.08);
`;

const BlockGroupItemWrapper = styled.div`
  border-radius: 8px;
  border: ${({ theme }) => `1px solid ${theme.colors.gray[4]}`};
  background: rgba(245, 246, 249, 0.6);
  backdrop-filter: blur(30px);
  padding: 12px;
`;

const BlockGroupHead = styled.div<{ collapsed: boolean }>`
  display: flex;
  margin-bottom: ${({ collapsed }) => (collapsed ? "unset" : `12px`)};
  justify-content: space-between;
  cursor: pointer;

  > div {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
`;

const NestedList = styled.div<{ collapsed: boolean }>`
  display: ${({ collapsed }) => (collapsed ? "none" : "block")};

  div {
    margin-bottom: 8px;
  }

  div:last-child {
    margin-bottom: 0;
  }
`;
