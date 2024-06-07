import React, { useState } from "react";
import { t } from "@lingui/macro";
import styled from "styled-components";
import { Avatar, Separator, Tooltip } from "@radix-ui/themes";
import { FileIcon } from "@radix-ui/react-icons";

import useAuthUserStore from "store/AuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import LeftSecondarySide, {
  LeftSecondaryType,
} from "components/Document/LeftSide/LeftSecondarySide";
import IkigaiIconButton from "components/base/IconButton";
import ManageSpaceModal from "./ManageSpaceModal";

const LeftSide = () => {
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const [openProfile, setOpenProfile] = useState(false);
  const [leftSecondaryType, setLeftSecondaryType] = useState<
    LeftSecondaryType | undefined
  >(LeftSecondaryType.Content);

  const myName = me ? `${me.firstName} ${me.lastName}` : t`Unknown`;

  const onClickContent = () => {
    setLeftSecondaryType(
      leftSecondaryType === LeftSecondaryType.Content
        ? undefined
        : LeftSecondaryType.Content,
    );
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
              active={LeftSecondaryType.Content === leftSecondaryType}
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
      <LeftSecondarySide selectedType={leftSecondaryType} />
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
