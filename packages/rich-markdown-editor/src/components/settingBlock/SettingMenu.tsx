import { MenuProps } from "antd";
import styled from "styled-components";
import {
  // AnnotationIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CircleDoubleRightArrowIcon,
  DuplicateIcon,
  TrashIcon,
} from "../../menus/icons";
import { Text } from "../common/Text";
import React from "react";

export enum SettingMenuKey {
  ChangeBlock = "Change block",
  AddComment = "Add comment",
  MoveUp = "Move up",
  MoveDown = "Move down",
  InsertAbove = "Insert block above",
  InsertBelow = "Insert block below",
  Duplicate = "Duplicate",
  Delete = "Delete",
}

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  color?: string;
}> = ({ icon, label, color = "#181E2D" }) => {
  return (
    <StyledItem>
      {icon}
      <Text color={color}>{label}</Text>
    </StyledItem>
  );
};

export const settingMenuItems = (
  callback: (
    key: string,
    domEvent: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void
): MenuProps["items"] => [
  {
    key: SettingMenuKey.ChangeBlock,
    label: (
      <MenuItem
        icon={<CircleDoubleRightArrowIcon />}
        label={SettingMenuKey.ChangeBlock}
      />
    ),
    onMouseEnter: ({ key, domEvent }) => callback(key, domEvent),
  },
  {
    type: "divider",
  },
  // {
  //   key: SettingMenuKey.AddComment,
  //   label: (
  //     <MenuItem icon={<AnnotationIcon />} label={SettingMenuKey.AddComment} />
  //   ),
  //   onMouseEnter: ({ key, domEvent }) => callback(key, domEvent),
  // },
  // {
  //   type: "divider",
  // },
  // {
  //   key: SettingMenuKey.MoveUp,
  //   label: <MenuItem icon={<ArrowUpIcon />} label={SettingMenuKey.MoveUp} />,
  //   onMouseEnter: ({ key, domEvent }) => callback(key, domEvent),
  // },
  // {
  //   key: SettingMenuKey.MoveDown,
  //   label: (
  //     <MenuItem icon={<ArrowDownIcon />} label={SettingMenuKey.MoveDown} />
  //   ),
  //   onMouseEnter: ({ key, domEvent }) => callback(key, domEvent),
  // },
  // {
  //   type: "divider",
  // },
  {
    key: SettingMenuKey.InsertAbove,
    label: (
      <MenuItem icon={<ArrowUpIcon />} label={SettingMenuKey.InsertAbove} />
    ),
    onMouseEnter: ({ key, domEvent }) => callback(key, domEvent),
  },
  {
    key: SettingMenuKey.InsertBelow,
    label: (
      <MenuItem icon={<ArrowDownIcon />} label={SettingMenuKey.InsertBelow} />
    ),
    onMouseEnter: ({ key, domEvent }) => callback(key, domEvent),
  },
  {
    type: "divider",
  },
  {
    key: SettingMenuKey.Duplicate,
    label: (
      <MenuItem icon={<DuplicateIcon />} label={SettingMenuKey.Duplicate} />
    ),
    onMouseEnter: ({ key, domEvent }) => callback(key, domEvent),
  },
  {
    key: SettingMenuKey.Delete,
    label: (
      <MenuItem
        icon={<TrashIcon />}
        label={SettingMenuKey.Delete}
        color="#FF4D4F"
      />
    ),
    onMouseEnter: ({ key, domEvent }) => callback(key, domEvent),
  },
];

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px;
`;
