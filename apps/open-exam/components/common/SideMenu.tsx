import React from "react";

import { Button, Space, Tooltip } from "antd";
import { useRouter } from "next/router";
import styled from "styled-components";
import { t } from "@lingui/macro";
import Link from "next/link";

import { Routes } from "config/Routes";

import Loading from "../Loading";
import useAuthUserStore from "context/ZustandAuthStore";
import useUserPermission from "hook/UseUserPermission";
import { Permission } from "util/permission";
import { TrashIcon, ClassIcon, OrganizationIcon } from "icons";

const StyledSideMenu = styled.div`
  margin-top: 60px;
  height: calc(100vh - 60px);
  background: var(--gray-1, #fff);
  display: flex;
  flex-direction: column;
  padding: 20px 12px 12px 12px;
  justify-content: space-between;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
`;

const ButtonSizeMenu = styled(Button)`
  svg {
    color: #fff;
  }
`;

const getColor = (isActive: boolean) => (isActive ? "#065051" : "#888E9C");

export const SideMenu = () => {
  const router = useRouter();
  const allow = useUserPermission();
  const authUser = useAuthUserStore((state) => state.currentUser);
  const pathNameAsArray = router.pathname.split("/");

  const activeParentPathName =
    pathNameAsArray.includes(pathNameAsArray[1]) && pathNameAsArray.length
      ? `/${pathNameAsArray[1] === "classes" ? "courses" : pathNameAsArray[1]}`
      : router.pathname;

  if (!authUser) return <Loading />;

  const items = [
    {
      icon: (
        <ClassIcon color={getColor(activeParentPathName === Routes.Classes)} />
      ),
      key: Routes.Classes,
      label: t`Classes`,
    },
    ...(allow(Permission.ManageOrgInformation)
      ? [
          {
            icon: (
              <OrganizationIcon
                color={getColor(activeParentPathName === Routes.Organization)}
              />
            ),
            key: Routes.Organization,
            label: t`Organization`,
          },
        ]
      : []),
  ];

  return (
    <StyledSideMenu>
      <Space direction="vertical" size={12}>
        {items.map((item, index) => (
          <Tooltip
            key={index}
            placement="right"
            title={item.label}
            arrow={false}
          >
            <ButtonSizeMenu
              onClick={() => router.push(item.key)}
              type="text"
              size="large"
              icon={item.icon}
            />
          </Tooltip>
        ))}
      </Space>
      {allow(Permission.ManageTrash) && (
        <Link href={Routes.Trash} passHref>
          <ButtonSizeMenu
            type="text"
            size="large"
            icon={
              <TrashIcon
                color={getColor(activeParentPathName === Routes.Trash)}
              />
            }
          />
        </Link>
      )}
    </StyledSideMenu>
  );
};
