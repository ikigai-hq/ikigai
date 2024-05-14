import { t } from "@lingui/macro";
import { Tabs } from "antd";

import Modal from "../common/Modal";
import useSpaceStore from "context/ZustandSpaceStore";
import GeneralSpaceSetting from "./GeneralSpaceSetting";
import MemberSpaceSetting from "./MemberSpaceSetting";
import InviteSpaceSetting from "./InviteSpaceSetting";
import usePermission from "hook/UsePermission";
import { SpaceActionPermission } from "graphql/types";

export enum SpaceSettingTabKeys {
  General = "general",
  Members = "members",
  Invites = "invites",
}

const SpaceSetting = () => {
  const spaceSettingVisible = useSpaceStore(
    (state) => state.spaceSettingVisible,
  );
  const setSpaceSettingVisible = useSpaceStore(
    (state) => state.setSpaceSettingVisible,
  );
  const allow = usePermission();
  const onClose = () => setSpaceSettingVisible(false);

  const tabs = [];
  if (allow(SpaceActionPermission.MANAGE_SPACE_SETTING)) {
    tabs.push({
      label: t`Details`,
      key: SpaceSettingTabKeys.General,
      children: <GeneralSpaceSetting />,
    });
  }

  if (allow(SpaceActionPermission.MANAGE_SPACE_MEMBER)) {
    tabs.push(
      {
        label: t`Members`,
        key: SpaceSettingTabKeys.Members,
        children: <MemberSpaceSetting />,
      },
      {
        label: t`Invites`,
        key: SpaceSettingTabKeys.Invites,
        children: <InviteSpaceSetting />,
      },
    );
  }

  return (
    <Modal
      visible={spaceSettingVisible}
      onClose={onClose}
      title={t`Space settings`}
      width={"70vw"}
    >
      <Tabs items={tabs} />
    </Modal>
  );
};

export default SpaceSetting;
