import { t } from "@lingui/macro";
import { Avatar, Box, Tooltip } from "@radix-ui/themes";
import React, { useState } from "react";
import styled from "styled-components";

import ManageSpace from "./ManageSpace";
import Modal from "components/base/Modal";
import useSpaceStore from "store/SpaceStore";

const ManageSpaceModal = () => {
  const [openModal, setOpenModal] = useState(false);
  const setSpaceSettingVisible = useSpaceStore(
    (state) => state.setSpaceSettingVisible,
  );
  const spaceName = useSpaceStore((state) => state.space?.name);

  return (
    <Modal
      content={
        <ManageSpace onClickSpaceSetting={() => setSpaceSettingVisible(true)} />
      }
      title={t`${spaceName} Settings`}
      description={t`Manage, Switch, or Create Space`}
      open={openModal}
      onOpenChange={setOpenModal}
      maxWidth="30vw"
      minWidth="300px"
    >
      <Tooltip content={t`Space Settings & Switch Space`}>
        <SpaceWrapper onClick={() => setOpenModal(true)}>
          <Avatar
            variant="solid"
            radius={"small"}
            fallback={spaceName ? spaceName.charAt(0) : "I"}
            size="2"
          />
        </SpaceWrapper>
      </Tooltip>
    </Modal>
  );
};

const SpaceWrapper = styled(Box)`
  margin: 5px auto;
  height: 40px;
  cursor: pointer;
`;

export default ManageSpaceModal;
