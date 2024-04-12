import React from "react";
import styled, { useTheme } from "styled-components";

import PreviewTemplate from "./PreviewTemplate";
import TemplateList from "./TemplateList";
import useDocumentTemplateStore, {
  TemplateType,
} from "context/ZustandDocumentTemplateStore";
import { GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories } from "graphql/types";

export type RightTemplateSideProps = {
  selectedCategory?: GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories;
  selectedTemplateType: TemplateType;
  isModal: boolean;
  currentDocumentId?: string;
};

const RightTemplateSide = ({
  selectedCategory,
  selectedTemplateType,
  isModal,
  currentDocumentId,
}: RightTemplateSideProps) => {
  const isCommunity = selectedTemplateType === TemplateType.Community;
  const selectedTemplateId = useDocumentTemplateStore(
    (state) => state.selectedPreviewTemplateId,
  );
  const setSelectedTemplateId = useDocumentTemplateStore(
    (state) => state.setSelectedPreviewTemplateId,
  );
  const theme = useTheme();

  return (
    <RightSideContainer
      style={{
        background: isModal ? "" : theme.colors.gray[0],
        marginLeft: isModal ? 0 : 16,
      }}
    >
      <div style={{ height: "100%" }}>
        {!selectedTemplateId && (
          <TemplateList
            selectedCategory={selectedCategory}
            isCommunity={isCommunity}
            onSelectedTemplate={setSelectedTemplateId}
            isModal={isModal}
          />
        )}
        {selectedTemplateId && (
          <PreviewTemplate
            selectedTemplateId={selectedTemplateId}
            onSelectedTemplate={setSelectedTemplateId}
            currentDocumentId={currentDocumentId}
          />
        )}
      </div>
    </RightSideContainer>
  );
};

const RightSideContainer = styled.div`
  flex: 1;
  border-top-right-radius: 16px;
`;

export default RightTemplateSide;
