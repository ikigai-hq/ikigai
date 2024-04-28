import React from "react";
import { MoreOutlined } from "@ant-design/icons";
import { Dropdown, Popconfirm } from "antd";
import { Text } from "./Text";

export interface IMenuItem<T> {
  title: string;
  callback: (item: T) => void;
  popConfirm?: {
    title: string;
  };
  color?: string;
  hide?: boolean;
}

interface Props<T> {
  item: T;
  menuList: IMenuItem<T>[];
  hasPermission: boolean;
  children?: React.ReactElement<any, any>;
}

export const ActionMenuDropdown = <T extends unknown>({
  item,
  menuList,
  hasPermission,
  children,
}: Props<T>) => {
  const filteredItems = menuList.filter((item) => !item.hide) || [];
  const menuItems = filteredItems.map((m) => ({
    key: m.title,
    label: m.popConfirm ? (
      <Popconfirm
        key={m.title}
        trigger="click"
        title={m.popConfirm.title}
        onConfirm={() => m.callback(item)}
      >
        <Text color={m.color} level={2}>
          {m.title}
        </Text>
      </Popconfirm>
    ) : (
      <Text color={m.color} level={2}>
        {m.title}
      </Text>
    ),
    onClick: () => {
      if (!m.popConfirm) m.callback(item);
    },
  }));

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {hasPermission && filteredItems.length !== 0 && (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: menuItems,
          }}
        >
          {children || <MoreOutlined />}
        </Dropdown>
      )}
    </div>
  );
};
