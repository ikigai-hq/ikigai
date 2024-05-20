import Modal from "../common/Modal";
import { t, Trans } from "@lingui/macro";
import { Button, Divider, Input, Select, Typography } from "antd";
import { useMutation } from "@apollo/client";
import { useState } from "react";

import {
  GenerateSpaceInviteToken,
  Role,
  SpaceInviteTokenInput,
} from "graphql/types";
import { GENERATE_SPACE_INVITE_TOKEN } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import useSpaceStore from "../../store/SpaceStore";
import { getNowAsSec } from "../../util/Time";
import { formatPreJoinSpaceUrl } from "../../config/Routes";
import copy from "copy-to-clipboard";
import { toast } from "react-hot-toast";

const THIRTY_MINS = 1800;
const SIX_HOURS = 21600;
const SEVEN_DAYS = 604800;

export type CreateSpaceInviteProps = {
  visible: boolean;
  onClose: () => void;
};

const CreateSpaceInvite = ({ visible, onClose }: CreateSpaceInviteProps) => {
  const spaceId = useSpaceStore((state) => state.spaceId);
  const [role, setRole] = useState(Role.STUDENT);
  const [expireAfter, setExpireAfter] = useState<number | undefined>(
    SEVEN_DAYS,
  );
  const [generateSpaceInviteToken, { data, loading }] =
    useMutation<GenerateSpaceInviteToken>(GENERATE_SPACE_INVITE_TOKEN, {
      onError: handleError,
    });

  const onGenerate = async () => {
    const expireAt = expireAfter ? getNowAsSec() + expireAfter : undefined;
    const dataInput: SpaceInviteTokenInput = {
      spaceId,
      invitingRole: role,
      expireAt,
    };

    await generateSpaceInviteToken({
      variables: {
        data: dataInput,
      },
    });
  };

  return (
    <Modal visible={visible} onClose={onClose} title={t`Space invite link`}>
      <div>
        <div>
          <Typography.Text strong>
            <Trans>Expire after</Trans>
          </Typography.Text>
          <br />
          <Select
            style={{ width: "100%" }}
            value={expireAfter}
            onChange={setExpireAfter}
          >
            <Select.Option value={THIRTY_MINS}>30 minutes</Select.Option>
            <Select.Option value={SIX_HOURS}>6 hours</Select.Option>
            <Select.Option value={SEVEN_DAYS}>7 days</Select.Option>
            <Select.Option value={undefined}>Never</Select.Option>
          </Select>
        </div>
        <div style={{ marginTop: "10px" }}>
          <Typography.Text strong>
            <Trans>Inviting role</Trans>
          </Typography.Text>
          <br />
          <Select style={{ width: "100%" }} value={role} onChange={setRole}>
            <Select.Option value={Role.STUDENT}>
              <Trans>Student</Trans>
            </Select.Option>
            <Select.Option value={Role.TEACHER}>
              <Trans>Teacher</Trans>
            </Select.Option>
          </Select>
        </div>
        <Divider />
        <Button
          type="primary"
          onClick={onGenerate}
          disabled={loading}
          loading={loading}
        >
          <Trans>Generate</Trans>
        </Button>
        {data && (
          <div>
            <Divider />
            <Input
              readOnly
              value={formatPreJoinSpaceUrl(
                data.spaceGenerateInviteToken.spaceId,
                data.spaceGenerateInviteToken.token,
              )}
              suffix={
                <Button
                  onClick={() => {
                    copy(
                      formatPreJoinSpaceUrl(
                        data.spaceGenerateInviteToken.spaceId,
                        data.spaceGenerateInviteToken.token,
                      ),
                    );
                    toast.success(t`Copied!`);
                  }}
                >
                  <Trans>Copy</Trans>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateSpaceInvite;
