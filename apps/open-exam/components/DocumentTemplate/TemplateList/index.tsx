import { Typography } from "antd";
import styled from "styled-components";

import { GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories } from "graphql/types";
import useDocumentTemplateStore from "context/ZustandDocumentTemplateStore";
import TemplateCardItem from "./TemplateCardItem";

export type TemplateListProps = {
  isCommunity: boolean;
  selectedCategory?: GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories;
  onSelectedTemplate: (templateId?: string) => void;
  isModal: boolean;
};

const TemplateList = ({
  selectedCategory,
  isCommunity,
  onSelectedTemplate,
  isModal,
}: TemplateListProps) => {
  const templates = useDocumentTemplateStore((state) =>
    Array.from(state.templates.values())
      .filter((template) => (isCommunity ? template.isPublished : true))
      .filter((template) => {
        if (!selectedCategory) return true;

        const categoryTags = selectedCategory.tags.map((tag) => tag.tag);
        return template.tags.some((tag) => categoryTags.includes(tag.tag));
      }),
  );

  return (
    <Container height={isModal ? "87vh" : "100%"}>
      <Typography.Title>
        {selectedCategory?.name || "All templates"}
      </Typography.Title>
      <ListContainer>
        {templates.map((template) => (
          <TemplateCardItem
            key={template.id}
            template={template}
            onClick={() => onSelectedTemplate(template.id)}
          />
        ))}
      </ListContainer>
    </Container>
  );
};

interface ContainerProps {
  height: string;
}

const Container = styled.div`
  padding: 16px;
  height: ${({ height }: ContainerProps) => height};
  overflow-y: auto;
`;

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(304px, 1fr));
  gap: 30px;
`;

export default TemplateList;
