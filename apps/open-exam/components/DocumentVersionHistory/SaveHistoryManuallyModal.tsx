import { t } from "@lingui/macro";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";

import { CREATE_DOCUMENT_VERSION } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "context/ZustandDocumentStore";
import { Button } from "../common/Button";
import Modal from "../common/Modal";
import { Input } from "../common/Input";

export type SaveHistoryManuallyProps = {
  visible: boolean;
  onClose: () => void;
};

const SaveHistoryManuallyModal = ({ visible, onClose }: SaveHistoryManuallyProps) => {
  const documentId = useDocumentStore(state => state.masterDocumentId);
  const [name, setName] = useState("");
  const [createDocumentVersion, { loading }] = useMutation(CREATE_DOCUMENT_VERSION, {
    onError: handleError,
  });
  
  const onCreateVersion = async () => {
    const { data } = await createDocumentVersion({ variables: {
        name,
        documentId,
      }},
    );
    if (data) {
      toast.success(t`Created!`);
      onClose();
    }
  };
  
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t`Save document version`}
    >
      <Input
        placeholder={t`Type version name..`}
        value={name}
        onChange={e => setName(e.currentTarget.value)}
      />
      <Button
        type="primary"
        style={{ float: "right" }}
        onClick={onCreateVersion}
        loading={loading}
        disabled={loading}
      >
        Create
      </Button>
    </Modal>
  );
};

export default SaveHistoryManuallyModal;
