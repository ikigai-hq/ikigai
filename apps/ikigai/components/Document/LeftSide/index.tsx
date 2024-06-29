import React, { useState } from "react";
import { t, Trans } from "@lingui/macro";
import styled from "styled-components";
import { Avatar, DropdownMenu, Separator } from "@radix-ui/themes";
import { FileIcon } from "@radix-ui/react-icons";

import useAuthUserStore from "store/AuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import LeftSecondarySide from "components/Document/LeftSide/LeftSecondarySide";
import IkigaiIconButton from "components/base/IconButton";
import ManageSpaceModal from "./ManageSpaceModal";
import useUIStore, { LeftSideBarOptions } from "store/UIStore";
import TokenStorage from "storage/TokenStorage";
import UserStorage from "storage/UserStorage";

const LeftSide = () => {
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

  const onClickContent = (event) => {
    event.stopPropagation();
    setUiConfig({
      leftSidebar:
        leftSidebar === LeftSideBarOptions.Content
          ? LeftSideBarOptions.None
          : LeftSideBarOptions.Content,
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
        </div>
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
  margin-top: 10px;
`;
