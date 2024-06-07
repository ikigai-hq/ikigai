import { t, Trans } from "@lingui/macro";
import { Box, Tabs, Text } from "@radix-ui/themes";

import useSpaceStore from "../../store/SpaceStore";
import GeneralSpaceSetting from "./GeneralSpaceSetting";
import MemberSpaceSetting from "./MemberSpaceSetting";
import InviteSpaceSetting from "./InviteSpaceSetting";
import usePermission from "hook/UsePermission";
import { SpaceActionPermission } from "graphql/types";
import Modal from "components/base/Modal";

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

  return (
    <Modal
      open={spaceSettingVisible}
      onOpenChange={setSpaceSettingVisible}
      title={t`Space settings`}
      content={
        <>
          <Tabs.Root defaultValue={SpaceSettingTabKeys.General}>
            <Tabs.List>
              <Tabs.Trigger value={SpaceSettingTabKeys.General}>
                <Trans>General</Trans>
              </Tabs.Trigger>
              {allow(SpaceActionPermission.MANAGE_SPACE_MEMBER) && (
                <Tabs.Trigger value={SpaceSettingTabKeys.Members}>
                  <Trans>Members</Trans>
                </Tabs.Trigger>
              )}
              {allow(SpaceActionPermission.MANAGE_SPACE_MEMBER) && (
                <Tabs.Trigger value={SpaceSettingTabKeys.Invites}>
                  <Trans>Invite</Trans>
                </Tabs.Trigger>
              )}
            </Tabs.List>

            <Box pt="3">
              <Tabs.Content value={SpaceSettingTabKeys.General}>
                <GeneralSpaceSetting />
              </Tabs.Content>

              <Tabs.Content value={SpaceSettingTabKeys.Members}>
                <MemberSpaceSetting />
              </Tabs.Content>

              <Tabs.Content value={SpaceSettingTabKeys.Invites}>
                <Text size="2">
                  <InviteSpaceSetting />
                </Text>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </>
      }
    />
  );
};

export default SpaceSetting;
