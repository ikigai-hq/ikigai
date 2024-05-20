import { Trans, t } from "@lingui/macro";
import Modal from "../common/Modal";
import { Button, Input, Typography } from "antd";
import useAuthUserStore from "../../store/AuthStore";
import { useState } from "react";
import { UPDATE_PROFILE } from "../../graphql/mutation/UserMutation";
import { handleError } from "../../graphql/ApolloClient";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";

export type EditProfileModalProps = {
  visible: boolean;
  onClose: () => void;
};

const EditProfileModal = ({ visible, onClose }: EditProfileModalProps) => {
  const me = useAuthUserStore((state) => state.currentUser?.userMe);
  const setProfile = useAuthUserStore((state) => state.setProfile);
  const [firstName, setFirstName] = useState(me?.firstName);
  const [lastName, setLastName] = useState(me?.lastName);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE, {
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
      onClose();
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title={t`Profile`}>
      <div>
        <Typography.Text strong>
          <Trans>Email</Trans>
        </Typography.Text>
        <br />
        <Typography.Text>{me.email}</Typography.Text>
      </div>
      <div>
        <Typography.Text strong>
          <Trans>First name</Trans>
        </Typography.Text>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.currentTarget.value)}
        />
      </div>
      <div>
        <Typography.Text strong>
          <Trans>Last name</Trans>
        </Typography.Text>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.currentTarget.value)}
        />
      </div>
      <Button
        type="primary"
        onClick={update}
        loading={loading}
        disabled={loading}
      >
        <Trans>Update</Trans>
      </Button>
    </Modal>
  );
};

export default EditProfileModal;
