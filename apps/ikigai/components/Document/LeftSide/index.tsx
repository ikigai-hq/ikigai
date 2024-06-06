import React, { useState } from "react";
import { t } from "@lingui/macro";
import styled from "styled-components";
import { Avatar, Box, Separator, Tooltip } from "@radix-ui/themes";
import { FileIcon } from "@radix-ui/react-icons";

import useAuthUserStore from "store/AuthStore";
import EditProfileModal from "components/UserCredential/EditProfileModal";
import useSpaceStore from "store/SpaceStore";
import ManageSpace from "./ManageSpace";
import Modal from "components/base/Modal";
import LeftSecondarySide, {
  LeftSecondaryType,
} from "components/Document/LeftSide/LeftSecondarySide";
import IkigaiIconButton from "components/base/IconButton";

const LeftSide = () => {
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const setSpaceSettingVisible = useSpaceStore(
    (state) => state.setSpaceSettingVisible,
  );
  const spaceName = useSpaceStore((state) => state.space?.name);
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
        <Modal
          content={
            <ManageSpace
              onClickSpaceSetting={() => setSpaceSettingVisible(true)}
            />
          }
          title={t`Space`}
          description={t`Manage, Switch, or Create Space`}
        >
          <SpaceWrapper>
            <Avatar
              variant="solid"
              radius={"small"}
              fallback={spaceName ? spaceName.charAt(0) : "I"}
              size="2"
            />
          </SpaceWrapper>
        </Modal>
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
        {openProfile && (
          <EditProfileModal
            visible={openProfile}
            onClose={() => setOpenProfile(false)}
          />
        )}
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

const SpaceWrapper = styled(Box)`
  margin: 5px auto;
  height: 40px;
  cursor: pointer;
`;
