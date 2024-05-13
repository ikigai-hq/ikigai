import { forwardRef } from "react";
import { MenuOption, Position } from "../types";
import styled from "styled-components";
import { Editor } from "@tiptap/react";
import Image from "next/image";
import { Typography } from "antd";
import { Text, TextWeight } from "components/common/Text";
import { getSlashMenuOptions, mappingGroupTitle } from "./SlashMenuOptions";

interface SlashMenuProps {
  open: boolean;
  position: Position;
  editor: Editor;
}

const SlashMenu = forwardRef<HTMLDivElement, SlashMenuProps>((props, ref) => {
  const { open, position, editor } = props;

  const menuOptions = getSlashMenuOptions(editor);

  return (
    <SlashMenuContainer $open={open} $position={position} ref={ref}>
      {Object.keys(menuOptions).map((m, index) => {
        const menuItemValue: MenuOption[] = menuOptions[m];
        return (
          <MenuItemWrapper key={m}>
            <GroupTitle>
              <Text weight={TextWeight.medium} color="#888E9C" level={1}>
                {mappingGroupTitle[m]}
              </Text>
            </GroupTitle>
            {menuItemValue.map((v) => {
              return (
                <MenuItem key={v.title}>
                  <MenuItemImage>
                    <Image
                      alt={v.title}
                      src={v.urlImage}
                      style={{ borderRadius: 4 }}
                      width={46}
                      height={46}
                    />
                  </MenuItemImage>
                  <div>
                    <Text level={2}>{v.title}</Text>
                    <Text
                      style={{ display: "block" }}
                      color="#888E9C"
                      level={1}
                    >
                      {v.descriptions}
                    </Text>
                  </div>
                </MenuItem>
              );
            })}
          </MenuItemWrapper>
        );
      })}
    </SlashMenuContainer>
  );
});

const SlashMenuContainer = styled.div<{
  $open: boolean;
  $position: Position;
}>`
  display: ${({ $open }) => ($open ? "block" : "none")};
  background: #fff;
  position: absolute;
  border-radius: 4px;
  padding: 8px;
  max-width: calc(-24px + 100vw);
  box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
    rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px;
  top: ${({ $position }) => ($position?.top ? $position.top : 0)}px;
  left: ${({ $position }) => ($position?.left ? $position.left : 0)}px;
`;

const GroupTitle = styled.div`
  padding: 0 8px;
`;

const MenuItemWrapper = styled.div`
  cursor: pointer;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  &:hover {
    background: rgba(55, 53, 47, 0.08);
  }
`;

const MenuItemImage = styled.div`
  border-radius: 4px;
  background: white;
  width: 46px;
  height: 46px;
  flex-grow: 0;
  flex-shrink: 0;
  box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px;
  margin-right: 8px;
`;

export default SlashMenu;
