import React from "react";

import { Typography } from "antd";

import Modal from "components/common/Modal";
import AddMember from "../AddMember";
import { Trans, t } from "@lingui/macro";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AddOrgMemberModal: React.FC<Props> = ({ visible, onClose }) => {
  return (
    <Modal
      onClose={onClose}
      visible={visible}
      title={t`Add Organization Member`}
      centered
    >
      <Typography.Text type="secondary" style={{ fontSize: "11px" }}>
        <Trans>
          We will send organization and access (includes password) information
          via email.
        </Trans>
      </Typography.Text>
      <AddMember onAddOrgMember={() => onClose()} />
    </Modal>
  );
};

export default AddOrgMemberModal;
