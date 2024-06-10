import React, { useState } from "react";
import { t } from "@lingui/macro";
import styled from "styled-components";
import { Avatar, Separator, Tooltip } from "@radix-ui/themes";
import { FileIcon } from "@radix-ui/react-icons";

import useAuthUserStore from "store/AuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import LeftSecondarySide from "components/Document/LeftSide/LeftSecondarySide";
import IkigaiIconButton from "components/base/IconButton";
import ManageSpaceModal from "./ManageSpaceModal";
import useUIStore, { LeftSideBarOptions } from "store/UIStore";

const LeftSide = () => {
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const [openProfile, setOpenProfile] = useState(false);
  const leftSidebar = useUIStore((state) => state.config.leftSidebar);
  const setUiConfig = useUIStore((state) => state.setConfig);
  const myName = me ? `${me.firstName} ${me.lastName}` : t`Unknown`;

  const onClickContent = () => {
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
        <EditProfileModal open={openProfile} onOpenChange={setOpenProfile}>
          <Tooltip content={myName}>
            <div
              style={{ margin: "5px auto", cursor: "pointer" }}
              onClick={() => setOpenProfile(true)}
            >
              <Avatar
                radius={"full"}
                fallback={myName.charAt(0)}
                color={"orange"}
                src={me?.avatar?.publicUrl}
                size="2"
              />
            </div>
          </Tooltip>
        </EditProfileModal>
      </Container>
      <Separator style={{ height: "100vh", width: 1 }} />
      <LeftSecondarySide />
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
