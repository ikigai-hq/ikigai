import { t, Trans } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import copy from "copy-to-clipboard";
import { toast } from "react-hot-toast";
import {
  Button,
  IconButton,
  Select,
  Separator,
  Text,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { Link1Icon } from "@radix-ui/react-icons";

import {
  GenerateSpaceInviteToken,
  Role,
  SpaceInviteTokenInput,
} from "graphql/types";
import { GENERATE_SPACE_INVITE_TOKEN } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import useSpaceStore from "store/SpaceStore";
import { getNowAsSec } from "util/Time";
import { formatPreJoinSpaceUrl } from "config/Routes";
import Modal from "components/base/Modal";

const THIRTY_MINS = 1800;
const SIX_HOURS = 21600;
const SEVEN_DAYS = 604800;

export type CreateSpaceInviteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

const CreateSpaceInvite = ({
  open,
  onOpenChange,
  children,
}: CreateSpaceInviteProps) => {
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

  const onChangeExpireAt = (valueStr: string) => {
    if (valueStr === "never") {
      setExpireAfter(undefined);
    } else {
      setExpireAfter(Number.parseInt(valueStr));
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t`Space invite link`}
      content={
        <div>
          <div>
            <Text weight="bold" size="3">
              <Trans>Expire after</Trans>
            </Text>
            <br />
            <Select.Root
              value={expireAfter.toString()}
              onValueChange={onChangeExpireAt}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Group>
                  <Select.Item value={THIRTY_MINS.toString()}>
                    30 minutes
                  </Select.Item>
                  <Select.Item value={SIX_HOURS.toString()}>
                    6 hours
                  </Select.Item>
                  <Select.Item value={SEVEN_DAYS.toString()}>
                    7 days
                  </Select.Item>
                  <Select.Item value={"Never"}>Never</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>
          <div style={{ marginTop: 5 }}>
            <Text weight="bold" size="3">
              <Trans>Inviting role</Trans>
            </Text>
            <br />
            <Select.Root
              value={role}
              onValueChange={(roleStr) => setRole(Role[roleStr])}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Group>
                  <Select.Item value={Role.STUDENT}>Student</Select.Item>
                  <Select.Item value={Role.TEACHER}>Teacher</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>
          <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
          <Button
            onClick={onGenerate}
            disabled={loading}
            loading={loading}
            variant="outline"
          >
            <Trans>Generate</Trans>
          </Button>
          {data && (
            <div>
              <Separator
                style={{ width: "100%", marginTop: 5, marginBottom: 5 }}
              />
              <Text weight="bold" size="3">
                <Trans>Invite link</Trans>
              </Text>
              <TextField.Root
                readOnly
                value={formatPreJoinSpaceUrl(
                  data.spaceGenerateInviteToken.spaceId,
                  data.spaceGenerateInviteToken.token,
                )}
                size="2"
              >
                <TextField.Slot />
                <TextField.Slot>
                  <Tooltip content={t`Copy invite link`}>
                    <IconButton
                      size="2"
                      variant="ghost"
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
                      <Link1Icon height="14" width="14" />
                    </IconButton>
                  </Tooltip>
                </TextField.Slot>
              </TextField.Root>
            </div>
          )}
        </div>
      }
    >
      {children}
    </Modal>
  );
};

export default CreateSpaceInvite;
