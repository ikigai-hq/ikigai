import { t, Trans } from "@lingui/macro";
import { Button, Divider, Typography } from "antd";
import styled from "styled-components";

import Modal from "./common/Modal";
import { useMutation, useQuery } from "@apollo/client";
import { GET_MY_SPACES } from "graphql/query/SpaceQuery";
import { handleError } from "graphql/ApolloClient";
import { CreateSpace, GetMySpaces, GetMySpaces_spaceMine } from "graphql/types";
import { formatDocumentRoute } from "config/Routes";
import useSpaceStore from "context/ZustandSpaceStore";
import { CREATE_SPACE } from "../graphql/mutation/SpaceMutation";
import toast from "react-hot-toast";

export type SwitchSpaceProps = {
  visible: boolean;
  onClose: () => void;
};

const SwitchSpace = ({ visible, onClose }: SwitchSpaceProps) => {
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
    <Modal
      visible={visible}
      onClose={onClose}
      title={t`Switch space`}
      width="400px"
    >
      <div>
        <Typography.Text type="secondary">
          <Trans>Click a space to switch</Trans>
        </Typography.Text>
        {spaces.map((space) => (
          <SpaceItemContainer
            key={space.id}
            $active={space.id === currentSpaceId}
            onClick={() => onSwitch(space)}
          >
            <Typography.Text strong>{space.name}</Typography.Text>
          </SpaceItemContainer>
        ))}
        <Divider />
        <Button
          type="primary"
          onClick={onCreateSpace}
          loading={loading}
          disabled={loading}
          style={{ width: "100%" }}
        >
          <Trans>Create space</Trans>
        </Button>
      </div>
    </Modal>
  );
};

const SpaceItemContainer = styled.div<{ $active: boolean }>`
  width: 100%;
  padding: 5px;
  border-radius: 8px;
  background: ${(props) =>
    props.$active ? props.theme.colors.primary[5] : "none"};
  margin-bottom: 5px;

  &:hover {
    cursor: pointer;
    background: ${(props) => props.theme.colors.primary[4]};
    color: white;
  }
`;

export default SwitchSpace;
