import React, { useEffect, useState } from "react";
import { Button, Dropdown, MenuProps } from "antd";
import { MoreIcon } from "../../menus/icons";
import styled from "styled-components";
import { SettingMenuKey, settingMenuItems } from "./SettingMenu";
import { ChangedBlock, PORTAL_ID } from "./ChangedBlock";
import { createPortal } from "react-dom";

export const ActionBlockMenu: React.FC<{ pos: number }> = ({ pos }) => {
  const [openMenuBlocks, setOpenMenuBlocks] = useState(false);
  const [clientRect, setClientRect] = useState<{
    left: number;
    top: number;
  }>({ left: 0, top: 0 });

  const updateAttrs = (open: boolean) => {
    const el = document.getElementById(`${pos}-action-btn`);
    if (el) {
      el.setAttribute("openingDropdown", String(open));
    }

    if (open === false) setOpenMenuBlocks(false);
  };

  const onClickMenuItem: MenuProps["onClick"] = () => {
    updateAttrs(false);
  };

  const onOpenBlocks = (
    key: string,
    domEvent: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    if (key === SettingMenuKey.ChangeBlock) {
      const { top, left } = domEvent.currentTarget.getBoundingClientRect();
      setOpenMenuBlocks(true);
      setClientRect({ left: left - 424 - 16, top: top - 16 });
    } else {
      setOpenMenuBlocks(false);
    }
  };

  useEffect(() => {
    const portalElement = document.getElementById(PORTAL_ID);
    return () => {
      portalElement?.remove();
    };
  }, []);

  return (
    <>
      <Dropdown
        destroyPopupOnHide
        trigger={["click"]}
        onOpenChange={updateAttrs}
        menu={{
          items: settingMenuItems(onOpenBlocks),
          onClick: onClickMenuItem,
          style: { padding: 16, width: 226 },
        }}
        placement="bottomRight"
      >
        <MoreActionBtn icon={<MoreIcon />} />
      </Dropdown>
      {openMenuBlocks &&
        createPortal(
          <ChangedBlock left={clientRect.left} top={clientRect.top} />,
          document.body
        )}
    </>
  );
};

const MoreActionBtn = styled(Button)`
  display: block !important;
  padding: 8px !important;
  border-radius: 8px !important;

  &:hover {
    border-color: #d9d9d9 !important;
  }
`;
