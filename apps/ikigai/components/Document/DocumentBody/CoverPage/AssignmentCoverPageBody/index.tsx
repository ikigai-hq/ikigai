import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Tabs } from "@radix-ui/themes";

import GeneralInformation from "./GeneralInformation";
import SubmissionList from "./SubmissionList";

export enum AssignmentCoverPageTabs {
  General = "general",
  Submissions = "submissions",
}

const AssignmentCoverPageBody = () => {
  return (
    <Tabs.Root defaultValue={AssignmentCoverPageTabs.General}>
      <Tabs.List>
        <Tabs.Trigger value={AssignmentCoverPageTabs.General}>
          <Trans>General</Trans>
        </Tabs.Trigger>
        <Tabs.Trigger value={AssignmentCoverPageTabs.Submissions}>
          <Trans>Submissions</Trans>
        </Tabs.Trigger>
      </Tabs.List>

      <Box pt="3">
        <Tabs.Content value={AssignmentCoverPageTabs.General}>
          <GeneralInformation />
        </Tabs.Content>

        <Tabs.Content value={AssignmentCoverPageTabs.Submissions}>
          <SubmissionList />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
};

export default AssignmentCoverPageBody;
