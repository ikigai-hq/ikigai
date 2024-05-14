import { Button, Divider, Typography } from "antd";
import styled from "styled-components";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";

import { SettingIcon } from "components/common/IconSvg";
import useSpaceStore from "context/ZustandSpaceStore";
import { useMutation, useQuery } from "@apollo/client";
import { CreateSpace, GetMySpaces, GetMySpaces_spaceMine } from "graphql/types";
import { GET_MY_SPACES } from "graphql/query/SpaceQuery";
import { handleError } from "graphql/ApolloClient";
import { CREATE_SPACE } from "graphql/mutation/SpaceMutation";
import { formatDocumentRoute } from "config/Routes";

export type ManageSpaceProps = {
  onClickSpaceSetting: () => void;
};

const ManageSpace = ({ onClickSpaceSetting }: ManageSpaceProps) => {
  const currentSpaceId = useSpaceStore((state) => state.spaceId);
  const { data } = useQuery<GetMySpaces>(GET_MY_SPACES, {
    onError: handleError,
  });
  const [createSpace, { loading }] = useMutation<CreateSpace>(CREATE_SPACE, {
    onError: handleError,
  });

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
    <div style={{ width: "250px" }}>
      <ItemContainer onClick={onClickSpaceSetting}>
        <SettingIcon />
        <Typography.Text>
          <Trans>Space Setting</Trans>
        </Typography.Text>
      </ItemContainer>
      <Divider style={{ marginTop: 10, marginBottom: 10 }} />
      <div style={{ marginBottom: 5 }}>
        <Typography.Text strong>My Spaces</Typography.Text>
      </div>
      {spaces.map((space) => (
        <ItemContainer
          key={space.id}
          onClick={() => onSwitch(space)}
          $active={space.id === currentSpaceId}
        >
          <Typography.Text>{space.name}</Typography.Text>
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
    </div>
  );
};

const ItemContainer = styled.div<{ $active?: boolean }>`
  height: 28px;
  cursor: pointer;
  border-radius: 8px;
  padding: 2px 10px 2px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 450;
  background: ${(props) =>
    props.$active ? props.theme.colors.gray[4] : "unset"};

  &:hover {
    background: ${(props) => props.theme.colors.gray[4]};
  }
`;

export default ManageSpace;
