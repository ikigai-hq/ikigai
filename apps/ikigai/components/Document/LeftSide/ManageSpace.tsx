import styled from "styled-components";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Avatar, Button, ScrollArea, Separator, Text } from "@radix-ui/themes";
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
import { formatDocumentRoute } from "config/Routes";
import CreateSpaceInvite from "../../SpaceSetting/CreateSpaceInvite";
import usePermission from "hook/UsePermission";

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
    const documentPath = formatDocumentRoute(space.starterDocument.id);
    window.location.replace(documentPath);
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
      const documentPath = formatDocumentRoute(
        data.spaceCreate.starterDocument.id,
      );
      window.location.replace(documentPath);
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
        <ItemContainer onClick={() => setShowCreateInvite(true)}>
          <Text size="2" weight="medium">
            <Trans>Invite People</Trans>
          </Text>
          <PersonIcon width="18px" height="18px" />
        </ItemContainer>
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
          <ItemContainer
            key={space.id}
            onClick={() => onSwitch(space)}
            $active={space.id === currentSpaceId}
            style={{ justifyContent: "start" }}
          >
            <Avatar fallback={space.name.charAt(0)} size="1" />
            <Text size="2" truncate>
              {space.name}
            </Text>
          </ItemContainer>
        ))}
      </ScrollArea>
      {showCreateInvite && (
        <CreateSpaceInvite
          visible={showCreateInvite}
          onClose={() => setShowCreateInvite(false)}
        />
      )}
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
