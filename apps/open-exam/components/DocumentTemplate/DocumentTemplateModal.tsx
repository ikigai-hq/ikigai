import React from "react";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

import Modal from "../common/Modal";
import DocumentTemplate from "./index";
import useDocumentTemplateStore from "context/ZustandDocumentTemplateStore";
import useUserPermission from "hook/UseUserPermission";
import { TEMPLATE } from "util/FeatureConstant";
import { Permission } from "../../util/permission";
import useDocumentStore from "../../context/ZustandDocumentStore";

const DocumentTemplateModal = () => {
  const allow = useUserPermission();
  const isTemplateEnabled = useFeatureIsOn(TEMPLATE);
  const currentDocumentId = useDocumentStore(state => state.masterDocumentId);
  const openTemplateModal = useDocumentTemplateStore(
    (state) => state.openTemplateModal,
  );
  const setOpenTemplateModal = useDocumentTemplateStore(
    (state) => state.setChangeOpenTemplateModal,
  );
  if (!allow(Permission.ManageTemplate) || !isTemplateEnabled) return undefined;

  return (
    <Modal
      visible={openTemplateModal}
      onClose={() => setOpenTemplateModal(false)}
      width="97vw"
      centered
      padding="0"
    >
      <DocumentTemplate isModal currentDocumentId={currentDocumentId} />
    </Modal>
  );
};

export default DocumentTemplateModal;
