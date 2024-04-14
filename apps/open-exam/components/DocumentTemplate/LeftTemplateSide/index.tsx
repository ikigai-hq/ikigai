import { Segmented, Typography } from "antd";
import styled, { useTheme } from "styled-components";
import React from "react";

import CommunityCategoryList from "./CommunityCategoryList";
import OrganizationCategoryList from "./OrganizationCategoryList";
import { GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories } from "graphql/types";
import { TemplateType } from "context/ZustandDocumentTemplateStore";
import { Trans } from "@lingui/macro";

export type DocumentTemplateListProps = {
  selectedTemplateType: TemplateType;
  onChangeSelectedTemplateType: (templateType: TemplateType) => void;
  selectedCategory?: GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories;
  onChangeSelectedCategory: (
    selectedCategory: GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories,
  ) => void;
  isModal: boolean;
};

const LeftTemplateSide = ({
  selectedTemplateType,
  onChangeSelectedTemplateType,
  selectedCategory,
  onChangeSelectedCategory,
  isModal,
}: DocumentTemplateListProps) => {
  const theme = useTheme();
  const SEGMENT_OPTIONS = [
    {
      value: TemplateType.Library,
      label: (
        <Typography.Text><Trans>Library</Trans></Typography.Text>
      ),
    },
  ];

  return (
    <LeftSideContainer
      color={isModal ? theme.colors.gray[1] : theme.colors.gray[0]}
      height={isModal ? "87vh" : "100%"}
    >
      <div style={{ marginBottom: "10px" }}>
        <Segmented
          size="large"
          options={SEGMENT_OPTIONS}
          value={selectedTemplateType}
          onChange={onChangeSelectedTemplateType}
          style={{ width: "100%" }}
          block
        />
      </div>
      {selectedTemplateType === TemplateType.Community && (
        <CommunityCategoryList
          selectedCategory={selectedCategory}
          onChangeSelectedCategory={onChangeSelectedCategory}
        />
      )}
      {selectedTemplateType === TemplateType.Library && (
        <OrganizationCategoryList
          selectedCategory={selectedCategory}
          onChangeSelectedCategory={onChangeSelectedCategory}
        />
      )}
    </LeftSideContainer>
  );
};

interface LeftSideProps {
  height: string;
  color: string;
}

const LeftSideContainer = styled.div`
  width: 326px;
  box-shadow: rgba(255, 255, 255, 0.05) -1px 0px 0px 0px inset;
  display: flex;
  flex-direction: column;
  height: ${({ height }: LeftSideProps) => height};
  background: ${({ color }) => color};
  padding: 16px 24px;
  overflow-y: auto;
  border-bottom-left-radius: 16px;
  border-top-left-radius: 16px;
`;

export default LeftTemplateSide;
