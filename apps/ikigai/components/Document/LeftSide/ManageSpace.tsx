import styled from "styled-components";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button, ScrollArea, Separator, Text } from "@radix-ui/themes";
import { PlusIcon, GearIcon, PersonIcon } from "@radix-ui/react-icons";

import useSpaceStore from "store/SpaceStore";
import {
  CreateSpace,
  GetMySpaces,
  GetMySpaces_spaceMine,
  SpaceActionPermission,
} from "graphql/types";
import { GET_MY_SPACES } from "graphql/query/SpaceQuery";
import { handleError } from "graphql/ApolloClient";
import { CREATE_SPACE } from "graphql/mutation/SpaceMutation";
import { formatStartSpace } from "config/Routes";
import CreateSpaceInvite from "../../SpaceSetting/CreateSpaceInvite";
import usePermission from "hook/UsePermission";
import SpaceListItem from "../../SpaceListItem";

export type ManageSpaceProps = {
  onClickSpaceSetting: () => void;
};

const ManageSpace = ({ onClickSpaceSetting }: ManageSpaceProps) => {
  const allow = usePermission();
  const currentSpaceId = useSpaceStore((state) => state.spaceId);
  const { data } = useQuery<GetMySpaces>(GET_MY_SPACES, {
    onError: handleError,
  });
  const [createSpace, { loading }] = useMutation<CreateSpace>(CREATE_SPACE, {
    onError: handleError,
  });
  const [showCreateInvite, setShowCreateInvite] = useState(false);

  const onSwitch = (space: GetMySpaces_spaceMine) => {
    if (space.id === currentSpaceId) return;
    const startSpacePath = formatStartSpace(space.id);
    window.location.replace(startSpacePath);
  };

  const onCreateSpace = async () => {
    const { data } = await createSpace({
      variables: {
        data: {
          name: "New space",
        },
      },
    });

    if (data) {
      toast.success(t`Created! We're moving you to your new space`);
      const startSpacePath = formatStartSpace(data.spaceCreate.id);
      window.location.replace(startSpacePath);
    }
  };

  const spaces = data?.spaceMine || [];
  return (
    <div>
      {allow(SpaceActionPermission.MANAGE_SPACE_SETTING) && (
        <ItemContainer onClick={onClickSpaceSetting}>
          <Text size="2" weight="medium">
            <Trans>Space Settings</Trans>
          </Text>
          <GearIcon width="18px" height="18px" />
        </ItemContainer>
      )}
      {allow(SpaceActionPermission.MANAGE_SPACE_MEMBER) && (
        <CreateSpaceInvite
          open={showCreateInvite}
          onOpenChange={setShowCreateInvite}
        >
          <ItemContainer onClick={() => setShowCreateInvite(true)}>
            <Text size="2" weight="medium">
              <Trans>Invite People</Trans>
            </Text>
            <PersonIcon width="18px" height="18px" />
          </ItemContainer>
        </CreateSpaceInvite>
      )}
      <Separator style={{ width: "100%" }} />
      <div
        style={{
          marginTop: 5,
          marginBottom: 5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Text size="2" weight="bold" color="gray" style={{ flex: 1 }}>
          <Trans>My Spaces</Trans>
        </Text>
        <Button
          variant="soft"
          onClick={onCreateSpace}
          loading={loading}
          disabled={loading}
        >
          <PlusIcon />
          <Trans>New space</Trans>
        </Button>
      </div>
      <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 180 }}>
        {spaces.map((space) => (
          <SpaceListItem
            isActive={space.id === currentSpaceId}
            onClick={() => onSwitch(space)}
            key={space.id}
            spaceId={space.id}
            spaceName={space.name}
          />
        ))}
      </ScrollArea>
      <Text size="1" color="gray" weight="light">
        <Trans>Click item in the list to switch space</Trans>
      </Text>
    </div>
  );
};

const ItemContainer = styled.div<{ $active?: boolean }>`
  height: 28px;
  cursor: pointer;
  border-radius: 8px;
  padding: 2px 10px 2px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-weight: 450;
  background: ${(props) => (props.$active ? "#8EC8F6" : "unset")};

  &:hover {
    background: #c2e5ff;
  }
`;

export default ManageSpace;
