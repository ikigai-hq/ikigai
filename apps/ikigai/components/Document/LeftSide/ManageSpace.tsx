import { Avatar, Button, Divider, Typography } from "antd";
import styled, { useTheme } from "styled-components";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IconSettings, IconUserPlus } from "@tabler/icons-react";

import useSpaceStore from "context/SpaceStore";
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
  const theme = useTheme();
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
    <div style={{ width: "225px" }}>
      {allow(SpaceActionPermission.MANAGE_SPACE_SETTING) && (
        <ItemContainer onClick={onClickSpaceSetting}>
          <Typography.Text>
            <Trans>Space Settings</Trans>
          </Typography.Text>
          <IconSettings size={20} />
        </ItemContainer>
      )}
      {allow(SpaceActionPermission.MANAGE_SPACE_MEMBER) && (
        <ItemContainer onClick={() => setShowCreateInvite(true)}>
          <Typography.Text>
            <Trans>Invite People</Trans>
          </Typography.Text>
          <IconUserPlus size={20} />
        </ItemContainer>
      )}
      <Divider style={{ marginTop: 10, marginBottom: 10 }} />
      <div style={{ marginBottom: 5 }}>
        <Typography.Text type="secondary" strong>
          <Trans>My Spaces</Trans>
        </Typography.Text>
      </div>
      {spaces.map((space) => (
        <ItemContainer
          key={space.id}
          onClick={() => onSwitch(space)}
          $active={space.id === currentSpaceId}
          style={{ justifyContent: "start" }}
        >
          <Avatar
            size={"small"}
            shape="square"
            style={{ backgroundColor: theme.colors.primary[5] }}
          >
            {space.name.charAt(0)}
          </Avatar>
          <Typography.Text ellipsis>{space.name}</Typography.Text>
        </ItemContainer>
      ))}
      <Divider style={{ marginTop: 10, marginBottom: 10 }} />
      <div>
        <Button
          type="primary"
          onClick={onCreateSpace}
          loading={loading}
          disabled={loading}
          style={{ width: "100%" }}
        >
          <Trans>New space</Trans>
        </Button>
      </div>
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
  background: ${(props) =>
    props.$active ? props.theme.colors.primary[1] : "unset"};

  &:hover {
    background: ${(props) => props.theme.colors.gray[4]};
  }
`;

export default ManageSpace;
