import React from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import styled, { useTheme } from "styled-components";
import { t } from "@lingui/macro";

import { Routes } from "config/Routes";
import { Text, TextWeight } from "components/common/Text";
import CollapsedStorage from "storage/CollapsedStorage";
import TokenStorage from "storage/TokenStorage";
import UserStorage from "storage/UserStorage";

const ProfileLeftMenuContainer = styled.div`
  display: block;
`;

const Menu = styled.div`
  margin-bottom: 36px;
`;

const MenuTitle = styled(Text)`
  text-transform: uppercase;
  margin-bottom: 16px;
  display: block;
  width: 160px;
`;

const MenuItem = styled(Text)<{ $active?: boolean }>`
  margin-bottom: 14px;
  display: block;
  cursor: pointer;
  color: ${(props) =>
    props.$active ? props.theme.colors.blue[5] : props.theme.colors.gray[7]};
  font-weight: ${(props) =>
    props.$active ? TextWeight.bold : TextWeight.medium};
`;

interface IMenuItem {
  title: string;
  pathname?: string;
}

interface IMenu {
  title: string;
  menus: Array<IMenuItem>;
}

const LIST_MENU = [
  {
    title: t`User Settings`,
    menus: [
      {
        title: t`My Account`,
        pathname: Routes.MyAccount,
      },
      {
        title: t`Security Settings`,
        pathname: Routes.SecuritySettings,
      },
    ],
  },
  {
    title: t`Other`,
    menus: [
      {
        title: t`Logout`,
      },
    ],
  },
];

const ProfileLeftMenu = () => {
  const theme = useTheme();
  const router = useRouter();
  const logout = () => {
    TokenStorage.del();
    UserStorage.del();
    CollapsedStorage.del();
    window.location.replace("/");
  };

  return (
    <ProfileLeftMenuContainer>
      {LIST_MENU.map((menu: IMenu, index: number) => (
        <Menu key={index}>
          <MenuTitle
            level={1}
            weight={TextWeight.bold}
            color={theme.colors.gray[6]}
          >
            {menu.title}
          </MenuTitle>
          {menu.menus.map((item: IMenuItem) => (
            <div key={item.title}>
              {item.pathname ? (
                <Link href={item.pathname} passHref>
                  <a>
                    <MenuItem
                      $active={router.pathname === item.pathname}
                      level={3}
                    >
                      {item.title}
                    </MenuItem>
                  </a>
                </Link>
              ) : (
                <MenuItem
                  key={item.title}
                  $active={router.pathname === item.pathname}
                  level={3}
                  onClick={item.title === t`Logout` ? logout : undefined}
                >
                  {item.title}
                </MenuItem>
              )}
            </div>
          ))}
        </Menu>
      ))}
    </ProfileLeftMenuContainer>
  );
};

export default ProfileLeftMenu;
