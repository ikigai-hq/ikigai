import { EditorView } from "prosemirror-view";
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  GroupBlockItem,
  IMappingBlockGroupItemValue,
  defaultMenu,
} from "../menus/blockMenu.config";
import { Text } from "./common/Text";
import { findParentNode } from "prosemirror-utils";
import { capitalize, cloneDeep } from "lodash";
import { ExtensionName, ParentBlockMenu } from "../types/extensions.enum";
import { EmbedBlockMenu } from "./embedBlockMenu/EmbedBlockMenu";
import {
  AdvancedClientRect,
  useBoundingClientRect,
} from "../hooks/useBoundingClientRect";
import { TableList } from "./common/TableList";
import useHandleClickOutside from "../hooks/useClickoutside";
import { insertNewEmptyLine } from "../util/insertNewEmptyLine";
interface Props {
  editorView: EditorView;
  commands: Record<string, any>;
  isSearchMode: boolean;
  onClose: () => void;
  search?: string;
  isEnablePageBlock?: boolean;
}

export const OPEN_INLINE_REGEX = /^(?!\/(\w+)?)(.*)\/(\w+)?$/;
const ALLOW_INLINE_BLOCKS = ["fill_in_blank"];

export const CommandMenuV2: React.FC<Props> = ({
  editorView,
  search,
  commands,
  isSearchMode,
  onClose,
  isEnablePageBlock,
}) => {
  const initialBlockList: GroupBlockItem[] = Object.keys(defaultMenu)
    .map((m) => defaultMenu[m])
    .filter((item) => {
      if (isEnablePageBlock) return true;
      return item.name !== ParentBlockMenu.PageLayout;
    });
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndexParent, setSelectedIndexParent] = useState(0);
  const [selectedIndexChild, setSelectedIndexChild] = useState<number>(0);
  const [isActiveParent, setIsActiveParent] = useState(true);
  const [openSlashMenu, setOpenSlashMenu] = useState(false);
  const [currentMenuHeight, setCurrentMenuHeight] = useState(
    menuRef?.current?.offsetHeight
  );
  const [filteredBlocks, setFilteredBlocks] =
    useState<GroupBlockItem[]>(initialBlockList);
  const [childBlocks, setChildBlocks] = useState<IMappingBlockGroupItemValue[]>(
    []
  );
  const [floatingBlockName, setFloatingBlockName] = useState<ExtensionName>();

  useHandleClickOutside(menuRef, onClose);

  const checkMatchSearchValue = (
    value: string,
    searchText: string
  ): boolean => {
    return value.toLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1;
  };

  const virtualReference = useBoundingClientRect(
    editorView,
    editorView.state,
    openSlashMenu || floatingBlockName === ExtensionName.CommonEmbed
  );

  const debounceSearch = (value?: string) => {
    if (!value) {
      setFilteredBlocks(initialBlockList);
      setOpenSlashMenu(false);
      return;
    }

    if (value) {
      if (filteredBlocks.length === 0) {
        setOpenSlashMenu(false);
        return;
      }

      const clonedMenu = cloneDeep(initialBlockList);
      const result: GroupBlockItem[] = [];
      clonedMenu.forEach((m) => {
        const matchParentName = checkMatchSearchValue(m.name, value);
        const filterChildren = m.children?.filter((item) =>
          item.name ? checkMatchSearchValue(item.name, value) : false
        );

        if (matchParentName && !filterChildren?.length) {
          result.push(m);
        }

        if (filterChildren?.length) {
          m.children = filterChildren;
          result.push(m);
        }
      });

      if (result.length === 0) {
        setOpenSlashMenu(false);
        setFilteredBlocks([]);
        return;
      } else {
        setFilteredBlocks(result);
        setOpenSlashMenu(true);
      }
    }
  };

  useEffect(() => {
    if (isSearchMode) {
      filteredBlocks.length === initialBlockList.length && !search
        ? setOpenSlashMenu(true)
        : debounceSearch(search);
    } else {
      setOpenSlashMenu(false);
      setFloatingBlockName(undefined);
    }
  }, [search, isSearchMode]);

  useEffect(() => {
    setCurrentMenuHeight(menuRef?.current?.offsetHeight);
    setSelectedIndexParent(0);
  }, [filteredBlocks, floatingBlockName]);

  useEffect(() => {
    setChildBlocks(filteredBlocks[selectedIndexParent]?.children || []);
  }, [selectedIndexParent, filteredBlocks]);

  const clearSearch = () => {
    const { state, dispatch } = editorView;
    const nodeBefore = state.selection.$head.nodeBefore;
    if (nodeBefore && nodeBefore.text) {
      const lastSlashIndex = nodeBefore.text?.lastIndexOf("/");
      // remove the text from "/" to the pos of selection
      const clearOffset = nodeBefore.text.length - lastSlashIndex;
      // Prevent remove text before the current cursor
      // when choosing option from block menu in task bar.
      if (lastSlashIndex >= 0) {
        dispatch(
          state.tr.insertText(
            "",
            state.selection.to - clearOffset,
            state.selection.to
          )
        );
      }
    }
    onClose();
  };

  const insertBlock = (
    block?: IMappingBlockGroupItemValue,
    customAttrs?: Record<string, any>
  ) => {
    const { state } = editorView;
    const parent = findParentNode((node) => !!node)(state.selection);
    let item: IMappingBlockGroupItemValue | null;
    if (block) {
      customAttrs ? (block.attrs = customAttrs) : null;
      item = block;
    } else {
      const matchingMenuItem = (
        filteredBlocks[selectedIndexParent] as GroupBlockItem
      )?.children as IMappingBlockGroupItemValue[];
      item =
        matchingMenuItem && !isActiveParent
          ? matchingMenuItem[selectedIndexChild]
          : null;
    }
    const command = commands[item?.extensionName || ""];
    if (item?.extensionName === ExtensionName.CommonEmbed) {
      setOpenSlashMenu(false);
      setFloatingBlockName(ExtensionName.CommonEmbed);
      return;
    }
    clearSearch();
    if (parent && parent?.node.textContent.match(OPEN_INLINE_REGEX) && item) {
      if (!item.extensionName) return;
      if (
        item.extensionName &&
        ALLOW_INLINE_BLOCKS.includes(item.extensionName)
      ) {
        if (command) command(item.attrs);
        return;
      }
      insertNewEmptyLine(editorView);
    }
    if (item) {
      if (command) {
        command(item.attrs);
      } else {
        commands[`create${capitalize(item.extensionName)}`](item.attrs);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!openSlashMenu) {
        insertNewEmptyLine(editorView);
      } else {
        insertBlock();
        setIsActiveParent(true);
      }
    }

    if (openSlashMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        if (isActiveParent) {
          const nextIndexItem = selectedIndexParent + 1;
          setSelectedIndexParent(
            nextIndexItem >= filteredBlocks.length ? 0 : nextIndexItem
          );
        } else {
          const nextIndexItem = selectedIndexChild + 1;
          setSelectedIndexChild(
            nextIndexItem >= childBlocks.length ? 0 : nextIndexItem
          );
        }
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        if (isActiveParent) {
          const prevIndexItem = selectedIndexParent - 1;
          setSelectedIndexParent(
            prevIndexItem < 0 ? filteredBlocks.length - 1 : prevIndexItem
          );
        } else {
          const preIndexItem = selectedIndexChild - 1;
          const childrenBlocks = filteredBlocks[selectedIndexParent];
          const maxChildrenBlocks = childrenBlocks.children?.length;
          maxChildrenBlocks &&
            setSelectedIndexChild(
              preIndexItem < 0 ? maxChildrenBlocks - 1 : preIndexItem
            );
        }
      }

      if (e.key === "ArrowRight" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        setIsActiveParent(false);
        setSelectedIndexChild(0);
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        setIsActiveParent(true);
        setSelectedIndexChild(0);
      }

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    }
  };

  useEffect(() => {
    if (search || isSearchMode) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown, search, isSearchMode]);

  return (
    <CommandMenuContainer
      ref={menuRef}
      id="BLOCK_MENU" // DO NOT DELETE!!
      $innerDocHeight={window.innerHeight}
      $offsetHeight={currentMenuHeight || 442}
      $visible={
        openSlashMenu || floatingBlockName === ExtensionName.CommonEmbed
      }
      $coordinates={virtualReference}
    >
      {openSlashMenu && floatingBlockName !== ExtensionName.CommonEmbed && (
        <ColContainer>
          <LeftCol>
            {filteredBlocks.map((m, index) => {
              return (
                <Label
                  onMouseOver={(e: MouseEvent<HTMLElement>) => {
                    e.preventDefault();
                    setSelectedIndexParent(index);
                    setSelectedIndexChild(0);
                  }}
                  key={m.name}
                  $isActive={index === selectedIndexParent}
                  $hasBackground={
                    index === selectedIndexParent && isActiveParent
                  }
                >
                  <Text>{m.name}</Text>
                </Label>
              );
            })}
          </LeftCol>
          <RightCol>
            {childBlocks.map((m, index) => {
              const isActive = index === selectedIndexChild && !isActiveParent;

              if (m.extensionName === ExtensionName.Table) {
                return (
                  <TableList
                    key={m.name}
                    onCreateTable={(attrs) => insertBlock(m, attrs)}
                  />
                );
              }

              return (
                <Label
                  onMouseOver={(e: MouseEvent<HTMLElement>) => {
                    e.preventDefault();
                    setSelectedIndexChild(index);
                    setIsActiveParent(false);
                  }}
                  onClick={() => insertBlock(m)}
                  key={m.name}
                  $isActive={isActive}
                  $hasBackground={isActive}
                >
                  {m.icon}
                  <Text>{m.name}</Text>
                </Label>
              );
            })}
          </RightCol>
        </ColContainer>
      )}

      {floatingBlockName === ExtensionName.CommonEmbed && (
        <EmbedBlockMenu
          view={editorView}
          triggerEmbedBlock={(value: string) => {
            setFloatingBlockName(undefined);
            clearSearch();
            commands[ExtensionName.CommonEmbed || ""]({ href: value });
          }}
        />
      )}
    </CommandMenuContainer>
  );
};

export const CommandMenuContainer = styled.div<{
  $coordinates?: AdvancedClientRect;
  $visible: boolean;
  $offsetHeight?: number;
  $innerDocHeight?: number;
}>`
  position: absolute;
  top: ${({ $coordinates, $offsetHeight, $innerDocHeight }) => {
    if ($coordinates && $offsetHeight && $innerDocHeight) {
      const { top, height } = $coordinates;
      return top + height > Math.round($innerDocHeight / 2)
        ? top + height - $offsetHeight - 24
        : top + height;
    }
    return 0;
  }}px;
  left: ${({ $coordinates }) => ($coordinates ? $coordinates.left : 0)}px;
  display: ${({ $visible, $offsetHeight }) =>
    $visible && $offsetHeight ? "block" : "none"};
  z-index: 9999999;
  width: 100%;
  max-width: 400px;
  padding: 12px;
  border-radius: 12px;
  background-color: #ffff;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px 0px rgba(0, 0, 0, 0.08);
`;

export const ColContainer = styled.div`
  display: flex;
`;

export const Label = styled.div<{
  $isActive: boolean;
  $hasBackground?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  background-color: ${({ $hasBackground }) =>
    $hasBackground ? "#f9fafb" : "transparent"};

  > div {
    margin-left: 12px;
    color: ${({ $isActive }) => ($isActive ? "#181e2d" : "#888E9C")};
  }
`;

export const LeftCol = styled.div`
  min-width: 160px;
  flex-grow: 2/3;
  border-right: 1px solid #eaecef;
  padding-right: 12px;
`;

export const RightCol = styled.div`
  flex-grow: 1;
  padding-left: 12px;
`;
