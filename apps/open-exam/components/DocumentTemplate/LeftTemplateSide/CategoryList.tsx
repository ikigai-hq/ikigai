import { Divider, Typography } from "antd";
import React, { useState } from "react";
import styled from "styled-components";
import { EditOutlined } from "@ant-design/icons";
import { t, Trans } from "@lingui/macro";
import { useMutation } from "@apollo/client";
import { cloneDeep } from "lodash";

import {
  AddDocumentTemplateCategory,
  GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories as IDocumentCategory
} from "graphql/types";
import { TextButtonWithHover } from "../../common/Button";
import { Permission } from "util/permission";
import useUserPermission from "hook/UseUserPermission";
import EditCategoryModal from "../EditCategoryModal";
import useDocumentTemplateStore from "context/ZustandDocumentTemplateStore";
import { ADD_DOCUMENT_TEMPLATE_CATEGORY } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import toast from "react-hot-toast";

export type SelectedCategoryProps = {
  selectedCategory?: IDocumentCategory;
  onChangeSelectedCategory: (selectedCategory: IDocumentCategory) => void;
};

export type CategoryListProps = {
  categories: IDocumentCategory[];
  selectedCategory?: IDocumentCategory;
  onChangeSelectedCategory: (selectedCategory?: IDocumentCategory) => void;
  isCommunity: boolean;
};

const CategoryList = ({
  categories,
  selectedCategory,
  onChangeSelectedCategory,
  isCommunity,
}: CategoryListProps) => {
  const allow = useUserPermission();
  const canEdit = !isCommunity && allow(Permission.ManageTemplate);
  const [editingCategory, setEditingCategory] = useState<IDocumentCategory | undefined>();
  const [addCategory, { loading }] = useMutation<AddDocumentTemplateCategory>(
    ADD_DOCUMENT_TEMPLATE_CATEGORY, {
    onError: handleError,
  });
  const addCategories = useDocumentTemplateStore(state => state.addCategories);
  
  const afterSaveCategory = (category: IDocumentCategory) => {
    addCategories([category]);
    setEditingCategory(undefined);
  };
  
  const onAddNewCategory = async () => {
    if (loading) return;
    
    const { data } = await toast.promise(
      addCategory({
        variables: {
          category: "Untiled Category",
        },
      }),
      {
        loading: t`Creating...`,
        success: t`Created!`,
        error: t`Failed!`,
      },
    );
    if (data) {
      addCategories([cloneDeep(data.orgAddTemplateCategory)]);
    }
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>
        <Divider />
        <div>
          <CategoryContainer
            $active={!selectedCategory}
            onClick={() => onChangeSelectedCategory(undefined)}
          >
            <div
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <div style={{ flex: "1", display: "inline-grid" }}>
                <StyledText ellipsis $active={!selectedCategory}>
                  All templates
                </StyledText>
              </div>
            </div>
          </CategoryContainer>
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              canEdit={canEdit}
              categoryId={category.id}
              isActive={selectedCategory?.id === category.id}
              onChangeSelectedCategory={onChangeSelectedCategory}
              setEditingCategory={setEditingCategory}
            />
          ))}
          {
            canEdit &&
            <CategoryContainer
              style={{ justifyContent: "center", marginTop: "10px" }}
              onClick={onAddNewCategory}
            >
              <Typography.Text strong>
                <Trans>Add category</Trans>
              </Typography.Text>
            </CategoryContainer>
          }
        </div>
      </div>
      {
        editingCategory &&
        <EditCategoryModal
          category={editingCategory}
          visible={!!editingCategory}
          onClose={() => setEditingCategory(undefined)}
          afterSave={afterSaveCategory}
          afterDelete={() => {
            setEditingCategory(undefined);
            onChangeSelectedCategory(undefined);
          }}
        />
      }
    </div>
  );
};

type CategoryItemProps = {
  isActive: boolean;
  canEdit: boolean;
  categoryId: string;
  onChangeSelectedCategory: (category: IDocumentCategory) => void;
  setEditingCategory: (category: IDocumentCategory) => void;
};

const CategoryItem = (
  { categoryId, isActive, onChangeSelectedCategory, canEdit, setEditingCategory }: CategoryItemProps,
) => {
  const category = useDocumentTemplateStore(
    state => state.categories.get(categoryId)
  );
  
  return (
    <CategoryContainer
      $active={isActive}
      onClick={() => onChangeSelectedCategory(category)}
    >
      <div
        style={{ display: "flex", alignItems: "center", width: "100%" }}
      >
        <div style={{ flex: "1", display: "inline-grid" }}>
          <StyledText
            ellipsis
            $active={isActive}
          >
            {category?.name}
          </StyledText>
        </div>
        {canEdit && (
          <div>
            <TextButtonWithHover
              type="text"
              icon={<EditOutlined />}
              onClick={() => setEditingCategory(category)}
            />
          </div>
        )}
      </div>
    </CategoryContainer>
  );
};

const ButtonGroup = styled.div`
  display: none;
  padding: 0 5px;
`;

const StyledText = styled(Typography.Text)<{
  $active?: boolean;
  $weight?: number;
}>`
  color: ${(props) => props.theme.colors.gray[9]};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.014px;
`;

const CategoryContainer = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 5px 0 10px;
  height: 38px;
  gap: 8px;
  cursor: pointer;
  background-color: ${(props) => {
    if (props.$active) {
      return props.theme.colors.primary[4];
    }
    return "unset";
  }};
  border-radius: 8px;

  &:hover {
    background-color: ${(props) => props.$active ?
            props.theme.colors.primary[4] :
            props.theme.colors.gray[3]};
    ${ButtonGroup} {
      display: flex;
    }
  }
`;

export default CategoryList;
