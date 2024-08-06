import React, { useState } from "react";
import { t, Trans } from "@lingui/macro";
import styled from "styled-components";
import {
  Avatar,
  DropdownMenu,
  IconButton,
  Separator,
  Tooltip,
} from "@radix-ui/themes";
import {
  FileIcon,
  QuestionMarkCircledIcon,
  ReaderIcon,
  TableIcon,
} from "@radix-ui/react-icons";

import useAuthUserStore from "store/AuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import LeftSecondarySide from "components/Document/LeftSide/LeftSecondarySide";
import IkigaiIconButton from "components/base/IconButton";
import ManageSpaceModal from "./ManageSpaceModal";
import useUIStore, { LeftSideBarOptions } from "store/UIStore";
import TokenStorage from "storage/TokenStorage";
import UserStorage from "storage/UserStorage";
import usePermission from "hook/UsePermission";
import { SpaceActionPermission } from "graphql/types";

const LeftSide = () => {
  const allow = usePermission();
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const [openProfile, setOpenProfile] = useState(false);
  const leftSidebar = useUIStore((state) => state.config.leftSidebar);
  const setUiConfig = useUIStore((state) => state.setConfig);
  const myName = me ? `${me.firstName} ${me.lastName}` : t`Unknown`;

  const onClickLogout = () => {
    UserStorage.del();
    TokenStorage.del();
    window.location.href = "/";
  };

  const onClickCommunity = () => {
    window.open("https://discord.com/invite/XuYWkn6kUS", "_blank");
  };

  const onClickDocumentation = () => {
    window.open("https://ikigai.li", "_blank");
  };

  const onClickContent = () => {
    setUiConfig({
      leftSidebar:
        leftSidebar === LeftSideBarOptions.Content
          ? LeftSideBarOptions.None
          : LeftSideBarOptions.Content,
    });
  };

  const onClickGradebook = () => {
    setUiConfig({
      leftSidebar:
        leftSidebar === LeftSideBarOptions.Gradebook
          ? LeftSideBarOptions.None
          : LeftSideBarOptions.Gradebook,
    });
  };

  return (
    <>
      <Container>
        <ManageSpaceModal />
        <Separator style={{ width: "100%" }} />
        <div style={{ flex: 1, margin: "0 auto" }}>
          <MenuItemWrapper>
            <IkigaiIconButton
              size="2"
              variant="ghost"
              onClick={onClickContent}
              isActive={leftSidebar === LeftSideBarOptions.Content}
            >
              <FileIcon width="20" height="20" />
            </IkigaiIconButton>
          </MenuItemWrapper>
          {allow(SpaceActionPermission.MANAGE_SPACE_CONTENT) && (
            <MenuItemWrapper>
              <IkigaiIconButton
                size="2"
                variant="ghost"
                isActive={leftSidebar === LeftSideBarOptions.Gradebook}
                onClick={onClickGradebook}
              >
                <TableIcon width="20" height="20" />
              </IkigaiIconButton>
            </MenuItemWrapper>
          )}
        </div>
        <Tooltip content={t`Documentation`}>
          <IconButton
            size="3"
            variant="ghost"
            style={{ marginBottom: 10 }}
            color="gray"
            onClick={onClickDocumentation}
          >
            <ReaderIcon width="20" height="20" />
          </IconButton>
        </Tooltip>
        <Tooltip content={t`Community & Help`}>
          <IconButton
            size="3"
            variant="ghost"
            style={{ marginBottom: 1 }}
            color="gray"
            onClick={onClickCommunity}
          >
            <QuestionMarkCircledIcon width="20" height="20" />
          </IconButton>
        </Tooltip>
        <Separator style={{ width: "100%" }} />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <div style={{ margin: "5px auto", cursor: "pointer" }}>
              <Avatar
                radius={"full"}
                fallback={myName.charAt(0)}
                color={"orange"}
                src={me?.avatar?.publicUrl}
                size="2"
              />
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content style={{ padding: 5 }}>
            <DropdownMenu.Item color="red" onClick={onClickLogout}>
              <Trans>Log out</Trans>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onClick={() => setOpenProfile(true)}>
              <Trans>Edit Profile</Trans>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Container>
      <Separator style={{ height: "100vh", width: 1 }} />
      <LeftSecondarySide />
      <EditProfileModal open={openProfile} onOpenChange={setOpenProfile}>
        <></>
      </EditProfileModal>
    </>
  );
};

export default LeftSide;

const Container = styled.div<{ $hide?: boolean }>`
  min-width: 52px;
  display: ${({ $hide }) => ($hide ? "none" : "flex")};
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
  height: 100%;
  flex-direction: column;
`;

const MenuItemWrapper = styled.div`
  margin-top: 15px;
`;
