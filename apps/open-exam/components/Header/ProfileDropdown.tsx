/* eslint-disable @next/next/no-img-element */
import { Avatar, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import styled, { useTheme } from "styled-components";
import React from "react";
import { t } from "@lingui/macro";
import { useRouter } from "next/router";

import useAuthUserStore from "context/ZustandAuthStore";
import { Text } from "components/common/Text";
import {
  ArrowDocument,
  LogoutIcon,
  ProfileIcon,
} from "components/common/IconSvg";
import TokenStorage from "storage/TokenStorage";
import UserStorage from "storage/UserStorage";
import CollapsedStorage from "storage/CollapsedStorage";
import { Routes } from "config/Routes";

const ProfileDropDownContainer = styled.div`
  display: flex;
  align-items: center;

  &&& {
    .ant-dropdown-menu-item {
      padding: 8px 10px;
    }

    svg {
      color: ${(props) => props.theme.colors.gray[7]};
      height: 18px;
    }
  }
`;

const ProfileDropdown = () => {
  const router = useRouter();
  const currentUser = useAuthUserStore((state) => state.currentUser);
  const theme = useTheme();

  const logout = () => {
    TokenStorage.del();
    UserStorage.del();
    CollapsedStorage.del();
    window.location.replace("/");
  };

  const onClickProfile = () => {
    router.push(`/${Routes.MyAccount}`);
  };

  const items: MenuProps["items"] = [
    {
      key: "0",
      label: (
        <Space align="center" size={12}>
          <Avatar
            style={{ backgroundColor: "#fde3cf", color: "#f56a00" }}
            size={45}
          >
            {currentUser?.userMe?.activeOrgPersonalInformation?.firstName[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text level={2}>
              {currentUser?.userMe?.activeOrgPersonalInformation?.firstName}{" "}
              {currentUser?.userMe?.activeOrgPersonalInformation?.lastName}
            </Text>
            <Text level={1} color={theme.colors.gray[7]}>
              {currentUser?.userMe?.email}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: (
        <div
          onClick={onClickProfile}
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <ProfileIcon />
          <Text level={2}>{t`Profile Setting`}</Text>
        </div>
      ),
    },
  ];
  
  items.push(
    {
      type: "divider",
    },
    {
      key: "4",
      label: (
        <div
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <LogoutIcon />
          <Text level={2}>Sign out</Text>
        </div>
      ),
    },
  );

  return (
    <ProfileDropDownContainer>
      <Dropdown
        trigger={["click"]}
        placement={"bottomRight"}
        menu={{
          items: items,
        }}
        getPopupContainer={(trigger: any) => trigger.parentNode}
      >
        <Space align="center" style={{ cursor: "pointer" }}>
          <Avatar style={{ backgroundColor: "#fde3cf", color: "#f56a00" }}>
            {currentUser?.userMe?.activeOrgPersonalInformation?.fullName[0]}
          </Avatar>
          <Text level={2}>
            {currentUser?.userMe?.activeOrgPersonalInformation?.fullName}
          </Text>
          <ArrowDocument
            style={{ transform: "rotate(-90deg)", width: 15, marginTop: 5 }}
          />
        </Space>
      </Dropdown>
    </ProfileDropDownContainer>
  );
};

export default ProfileDropdown;
