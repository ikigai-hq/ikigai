import { Typography } from "antd";
import { t, Trans } from "@lingui/macro";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { cloneDeep } from "lodash";

import Modal from "../common/Modal";
import { Input } from "../common/Input";
import {
  AddDocumentTemplateTag,
  DocumentTemplateInput,
  GetCommunityTemplates_getCommunityDocumentTemplates as IDocumentTemplate
} from "../../graphql/types";
import {
  ADD_DOCUMENT_TEMPLATE_TAG, DELETE_DOCUMENT_TEMPLATE,
  DELETE_DOCUMENT_TEMPLATE_TAG,
  UPDATE_DOCUMENT_TEMPLATE
} from "../../graphql/mutation/DocumentMutation";
import { handleError } from "../../graphql/ApolloClient";
import TemplateTags from "./TemplateTags";
import { Button } from "../common/Button";
import useDocumentTemplateStore from "context/ZustandDocumentTemplateStore";
import { quickConfirmModal, useModal } from "hook/UseModal";

export type EditTemplateModalProps = {
  template: IDocumentTemplate,
  visible: boolean;
  onClose: () => void;
  afterSave: (template: IDocumentTemplate) => void;
  afterDelete: () => void;
};

const EditTemplateModal = (
  { template, visible, onClose, afterSave, afterDelete }: EditTemplateModalProps,
) => {
  const { modal } = useModal();
  const deleteTemplate = useDocumentTemplateStore(state => state.deleteTemplate);
  const addTags = useDocumentTemplateStore(state => state.addTags);
  const [innerTemplate, setInnerTemplate] = useState(cloneDeep(template));
  const [saving, setSaving] = useState(false);
  const [updateTemplate] = useMutation(UPDATE_DOCUMENT_TEMPLATE, {
    onError: handleError,
  });
  const [deleteTemplateInServer, { loading }] = useMutation(DELETE_DOCUMENT_TEMPLATE, {
    onError: handleError,
  });
  const [addTag] = useMutation<AddDocumentTemplateTag>(ADD_DOCUMENT_TEMPLATE_TAG, {
    onError: handleError,
  });
  const [removeTag] = useMutation(DELETE_DOCUMENT_TEMPLATE_TAG, {
    onError: handleError,
  });
  
  const onChangeName = (newName: string) => {
    innerTemplate.name = newName;
    setInnerTemplate({ ...innerTemplate });
  };
  
  const onAddTag = async (tag: string) => {
   return addTag({
      variables: {
        templateTag: {
          documentTemplateId: template.id,
          tag,
        },
      },
    });
  };
  
  const onDeleteTag = async (tag: string) => {
    return removeTag({
      variables: {
        templateTag: {
          documentTemplateId: template.id,
          tag,
        },
      },
    });
  };
  
  const onSave = async () => {
    setSaving(true);
    
    try {
      const updateData: DocumentTemplateInput = {
        id: template.id,
        name: innerTemplate.name,
      };
      await updateTemplate({
        variables: {
          template: updateData,
        },
      });
      // Tag
      const baseTags = template.tags.map(tag => tag.tag);
      const editedTags = innerTemplate.tags.map(tag => tag.tag);
      
      const newTags = editedTags
        .filter(tag => !baseTags.includes(tag));
      const removedTags = baseTags
        .filter(tag => !editedTags.includes(tag));
      
      addTags(newTags);
      await Promise.all(newTags.map(onAddTag));
      await Promise.all(removedTags.map(onDeleteTag));
      toast.success(t`Updated!`);
      afterSave(innerTemplate);
    } finally {
      setSaving(false);
    }
  };
  
  const onClickClose = () => {
    if (saving) return;
    onClose();
  };
  
  const onRemoveTemplate = async () => {
    quickConfirmModal(
      modal,
      t`Do you want to delete this document template?`,
      async () => {
        const { data } = await deleteTemplateInServer({
          variables: {
            templateId: innerTemplate.id,
          },
        });
        if (data) {
          deleteTemplate(innerTemplate);
          afterDelete();
        }
      },
    );
  };
  
  return (
    <Modal
      visible={visible}
      onClose={onClickClose}
      title={t`Edit template`}
    >
      <div>
        <Typography.Title level={5}>
          <Trans>Name</Trans>
        </Typography.Title>
        <Input
          placeholder={t`Typing template name`}
          defaultValue={innerTemplate.name}
          onChange={(e) => onChangeName(e.currentTarget.value)}
        />
      </div>
      <div>
        <Typography.Title level={5}>
          <Trans>Tags</Trans>
        </Typography.Title>
        <TemplateTags
          template={innerTemplate}
          editMode
          onChange={setInnerTemplate}
        />
      </div>
      <div>
        <Button
          type="primary"
          style={{ float: "right" }}
          loading={saving}
          disabled={saving}
          onClick={onSave}
        >
          <Trans>Save</Trans>
        </Button>
        <Button
          style={{ float: "right", marginRight: "10px" }}
          danger
          loading={loading}
          disabled={loading}
          onClick={onRemoveTemplate}
        >
          <Trans>Delete</Trans>
        </Button>
      </div>
    </Modal>
  );
};

export default EditTemplateModal;
