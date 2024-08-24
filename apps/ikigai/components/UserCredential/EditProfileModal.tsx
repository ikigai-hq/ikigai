import { Trans, t } from "@lingui/macro";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { TextField, Text } from "@radix-ui/themes";
import { useMutation } from "@apollo/client";

import useAuthUserStore from "store/AuthStore";
import { UPDATE_PROFILE } from "graphql/mutation/UserMutation";
import { handleError } from "graphql/ApolloClient";
import Modal from "components/base/Modal";

export type EditProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

const EditProfileModal = ({
  open,
  onOpenChange,
  children,
}: EditProfileModalProps) => {
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const setProfile = useAuthUserStore((state) => state.setProfile);
  const [firstName, setFirstName] = useState(me?.firstName);
  const [lastName, setLastName] = useState(me?.lastName);
  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    onError: handleError,
  });

  const update = async () => {
    const { data } = await updateProfile({
      variables: {
        input: {
          firstName,
          lastName,
          avatarFileId: undefined,
        },
      },
    });

    if (data) {
      setProfile(firstName, lastName);
      toast.success(t`Updated!`);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t`Profile`}
      onOk={update}
      content={
        <>
          <div>
            <Text weight="bold">
              <Trans>First name</Trans>
            </Text>
            <br />
            <Text>{me?.email}</Text>
          </div>
          <div>
            <label>
              <Text weight="bold">
                <Trans>First name</Trans>
              </Text>
              <TextField.Root
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
              />
            </label>
          </div>
          <div>
            <label>
              <Text weight="bold">
                <Trans>Last name</Trans>
              </Text>
              <TextField.Root
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
              />
            </label>
          </div>
        </>
      }
    >
      {children}
    </Modal>
  );
};

export default EditProfileModal;
