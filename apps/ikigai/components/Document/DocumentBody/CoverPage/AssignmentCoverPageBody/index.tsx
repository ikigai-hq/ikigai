import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Tabs } from "@radix-ui/themes";

import GeneralInformation from "./GeneralInformation";
import SubmissionList from "./SubmissionList";
import ShareAssignment from "./ShareAssignment";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import FormResponses from "./ShareAssignment/FormResponses";

export enum AssignmentCoverPageTabs {
  General = "general",
  Submissions = "submissions",
  Share = "share",
  ShareResponses = "shareResponses",
}

const AssignmentCoverPageBody = () => {
  const allow = usePermission();
  return (
    <Tabs.Root defaultValue={AssignmentCoverPageTabs.General}>
      <Tabs.List>
        <Tabs.Trigger value={AssignmentCoverPageTabs.General}>
          <Trans>General</Trans>
        </Tabs.Trigger>
        <Tabs.Trigger value={AssignmentCoverPageTabs.Submissions}>
          <Trans>Submissions</Trans>
        </Tabs.Trigger>
        {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
          <Tabs.Trigger value={AssignmentCoverPageTabs.Share}>
            <Trans>Share & Embed</Trans>
          </Tabs.Trigger>
        )}
        {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
          <Tabs.Trigger value={AssignmentCoverPageTabs.ShareResponses}>
            <Trans>Share Responses</Trans>
          </Tabs.Trigger>
        )}
      </Tabs.List>

      <Box pt="3">
        <Tabs.Content value={AssignmentCoverPageTabs.General}>
          <GeneralInformation />
        </Tabs.Content>

        <Tabs.Content value={AssignmentCoverPageTabs.Submissions}>
          <SubmissionList />
        </Tabs.Content>

        {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
          <Tabs.Content value={AssignmentCoverPageTabs.Share}>
            <ShareAssignment />
          </Tabs.Content>
        )}
        {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
          <Tabs.Content value={AssignmentCoverPageTabs.ShareResponses}>
            <FormResponses />
          </Tabs.Content>
        )}
      </Box>
    </Tabs.Root>
  );
};

export default AssignmentCoverPageBody;
