import {t} from "@lingui/macro";
import {Tabs} from "antd";

import Modal from "../common/Modal";
import useSpaceStore from "context/ZustandSpaceStore";
import GeneralSpaceSetting from "./GeneralSpaceSetting";
import MemberSpaceSetting from "./MemberSpaceSetting";
import InviteSpaceSetting from "./InviteSpaceSetting";

export enum SpaceSettingTabKeys {
  General = "general",
  Members = "members",
  Invites = "invites",
}

const SpaceSetting = () => {
  const spaceSettingVisible = useSpaceStore(state => state.spaceSettingVisible);
  const setSpaceSettingVisible = useSpaceStore(state => state.setSpaceSettingVisible);
  const onClose = () => setSpaceSettingVisible(false);
  
  const tabs = [
    {
      label: t`General`,
      key: SpaceSettingTabKeys.General,
      children: <GeneralSpaceSetting />,
    },
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
  ]
  
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
