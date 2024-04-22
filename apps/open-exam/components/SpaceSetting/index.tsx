import {t} from "@lingui/macro";
import {Tabs} from "antd";

import Modal from "../common/Modal";
import useSpaceStore from "context/ZustandSpaceStore";
import GeneralSpaceSetting from "./GeneralSpaceSetting";

export enum SpaceSettingTabKeys {
  General = "general",
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
    }
  ]
  
  return (
    <Modal
      visible={spaceSettingVisible}
      onClose={onClose}
      title={t`Space settings`}
    >
      <Tabs items={tabs} />
    </Modal>
  );
};

export default SpaceSetting;
