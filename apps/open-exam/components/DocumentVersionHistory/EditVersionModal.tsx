import { useMutation } from "@apollo/client";
import { t } from "@lingui/macro";
import { Button, Divider, Input } from "antd";
import Modal from "components/common/Modal";
import { handleError } from "graphql/ApolloClient";
import { UPDATE_DOCUMENT_VERSION } from "graphql/mutation/DocumentMutation";
import {
  GetDocumentHistoryVersions_documentGetHistoryVersions as IDocumentVersion,
} from "graphql/types";
import { cloneDeep } from "lodash";
import { useState } from "react";
import toast from "react-hot-toast";

export type EditVersionModalProps = {
  version: IDocumentVersion;
  visible: boolean;
  onClose: () => void;
  afterUpdate: (newVersion: IDocumentVersion) => void;
};

const EditVersionModal = ({ version, visible, onClose, afterUpdate }: EditVersionModalProps) => {
  const [name, setName] = useState(version.name);
  const [updateVersion, { loading }] = useMutation(UPDATE_DOCUMENT_VERSION, {
    onError: handleError,
  });

  const onClickUpdate = async () => {
    const { data } = await updateVersion({ variables: {
      data: {
        id: version.id,
        name,
      },
    }});

    if (data) {
      toast.success(t`Updated!`);
      const newVersion = cloneDeep(version);
      newVersion.name = name;
      afterUpdate(newVersion);
    }
  };

  return (
    <Modal
      onClose={onClose}
      visible={visible}
    >
      <div>
        <Input
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Divider />
        <Button
          type="primary"
          style={{ float: "right" }}
          onClick={onClickUpdate}
          loading={loading}
          disabled={loading}
        >
          Update
        </Button>
      </div>
    </Modal>
  );
};

export default EditVersionModal;
