import { t, Trans } from "@lingui/macro";
import { SelectProps, Typography } from "antd";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";

import {
  GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories as IDocumentCategory,
} from "graphql/types";
import Modal from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { useState } from "react";
import { Select } from "../common/Select";
import { cloneDeep } from "lodash";
import {
  ADD_DOCUMENT_CATEGORY_TAG,
  DELETE_DOCUMENT_CATEGORY_TAG, DELETE_DOCUMENT_TEMPLATE_CATEGORY,
  UPDATE_DOCUMENT_CATEGORY_TEMPLATE
} from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentTemplateStore from "context/ZustandDocumentTemplateStore";
import { quickConfirmModal, useModal } from "hook/UseModal";

export type EditCategoryModalProps = {
  category: IDocumentCategory;
  visible: boolean;
  onClose: () => void;
  afterSave: (category: IDocumentCategory) => void;
  afterDelete: () => void;
};

const EditCategoryModal = (
  { category, visible, onClose, afterSave, afterDelete }: EditCategoryModalProps,
) => {
  const { modal } = useModal();
  const availableTags = useDocumentTemplateStore(state => state.availableTags);
  const addTags = useDocumentTemplateStore(state => state.addTags);
  const deleteCategory = useDocumentTemplateStore(state => state.deleteCategory);
  const [innerCategory, setInnerCategory] = useState(cloneDeep(category));
  const [saving, setSaving] = useState(false);
  const [updateCategory] = useMutation(UPDATE_DOCUMENT_CATEGORY_TEMPLATE, {
    onError: handleError,
  });
  const [deleteCategoryInServer, { loading: deleteLoading}] = useMutation(DELETE_DOCUMENT_TEMPLATE_CATEGORY, {
    onError: handleError,
  });
  const [addTag] = useMutation(ADD_DOCUMENT_CATEGORY_TAG, {
    onError: handleError,
  });
  const [deleteTag] = useMutation(DELETE_DOCUMENT_CATEGORY_TAG, {
    onError: handleError,
  });
  
  const onChangeName = (newName: string) => {
    innerCategory.name = newName;
    setInnerCategory({...innerCategory});
  };
  
  const onSelectTag = (tag: string) => {
    innerCategory.tags.push({ tag });
    setInnerCategory({...innerCategory});
  };
  
  const onDeselectTag = (tag: string) => {
    const index = innerCategory.tags.findIndex(t => t.tag === tag);
    if (index > -1) {
      innerCategory.tags.splice(index, 1);
      setInnerCategory({...innerCategory});
    }
  };
  
  const onSave = async () => {
    setSaving(true);
    try {
      await updateCategory({
        variables: {
          category: {
            id: innerCategory.id,
            name: innerCategory.name,
            orgInternalIndex: innerCategory.orgInternalIndex,
          },
        },
      });
      // Tags
      const baseTags = category.tags.map(t => t.tag);
      const editingTags = innerCategory.tags.map(t => t.tag);
      const addedTags = editingTags.filter(tag => !baseTags.includes(tag));
      const removedTags = baseTags.filter(tag => !editingTags.includes(tag));
      
      addTags(addedTags);
      await Promise.all(addedTags.map(async (tag) => {
        return addTag({
          variables: {
            categoryTag: {
              categoryId: innerCategory.id,
              tag,
            },
          },
        });
      }));
      await Promise.all(removedTags.map(async (tag) => {
        return deleteTag({
          variables: {
            categoryTag: {
              categoryId: innerCategory.id,
              tag,
            },
          },
        });
      }));
      
      toast.success(t`Updated!`);
      afterSave(innerCategory);
    } finally {
      setSaving(false);
    }
  };
  
  const onDelete = () => {
    quickConfirmModal(
      modal,
      t`Do you want to delete this category?`,
      async () => {
        const { data } = await deleteCategoryInServer({
          variables: {
            categoryId: innerCategory.id,
          },
        });
        if (data) {
          deleteCategory(innerCategory);
          afterDelete();
        }
      },
    );
  };
  
  const options: SelectProps['options'] = availableTags.map(availableTag => {
    return {
      label: availableTag,
      value: availableTag,
    };
  });
  const selectedTags = innerCategory.tags.map(tag => tag.tag);
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t`Edit category`}
    >
      <div>
        <Typography.Title level={5}>
          <Trans>Name</Trans>
        </Typography.Title>
        <Input
          placeholder={t`Typing category name`}
          value={innerCategory.name}
          onChange={e => onChangeName(e.currentTarget.value)}
        />
      </div>
      <div>
        <Typography.Title level={5}>
          <Trans>Tags</Trans>
        </Typography.Title>
        <div>
          <Select
            mode="tags"
            placeholder={t`Add tag for category`}
            options={options}
            value={selectedTags}
            showArrow={false}
            onSelect={onSelectTag}
            onDeselect={onDeselectTag}
          />
        </div>
      </div>
      <div>
        <Button
          type="primary"
          style={{ float: "right" }}
          onClick={onSave}
          disabled={saving}
          loading={saving}
        >
          <Trans>Save</Trans>
        </Button>
        <Button
          type="primary"
          style={{ float: "right", marginRight: "10px" }}
          onClick={onDelete}
          disabled={deleteLoading}
          loading={deleteLoading}
          danger
        >
          <Trans>Delete</Trans>
        </Button>
      </div>
    </Modal>
  );
};

export default EditCategoryModal;
