import { Select, Text } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";
import React from "react";

import { DocumentVisibility } from "graphql/types";

export type VisibilityAttributeProps = {
  visibility: DocumentVisibility;
  onChangeVisibility: (visibility: DocumentVisibility) => void;
};

const VisibilityAttribute = ({
  visibility,
  onChangeVisibility,
}: VisibilityAttributeProps) => {
  return (
    <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
      <Select.Root
        value={visibility}
        onValueChange={onChangeVisibility}
        size="1"
      >
        <Select.Trigger variant="soft" style={{ width: "fit-content" }} />
        <Select.Content>
          <Select.Group>
            <Select.Item value={DocumentVisibility.PUBLIC}>
              <Trans>Public</Trans>
            </Select.Item>
            <Select.Item value={DocumentVisibility.PRIVATE}>
              <Trans>Private</Trans>
            </Select.Item>
            <Select.Item value={DocumentVisibility.ASSIGNEES}>
              <Trans>Assignees only</Trans>
            </Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <div>
        {visibility === DocumentVisibility.PUBLIC && (
          <Text color="gray">
            <Trans>
              All students of this space can access this assignment.
            </Trans>
          </Text>
        )}
        {visibility === DocumentVisibility.PRIVATE && (
          <Text color="gray">
            <Trans>Only you can access this assignment.</Trans>
          </Text>
        )}
        {visibility === DocumentVisibility.ASSIGNEES && (
          <Text color="gray">
            <Trans>
              Only assignees (listed below) can access this assignment.
            </Trans>
          </Text>
        )}
      </div>
    </div>
  );
};

export default VisibilityAttribute;
