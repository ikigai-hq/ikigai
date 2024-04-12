import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";

import LeftTemplateSide from "./LeftTemplateSide";
import RightTemplateSide from "./RightTemplateSide";
import {
  GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories as IDocumentCategory,
  GetOrgTags,
} from "graphql/types";
import useDocumentTemplateStore from "context/ZustandDocumentTemplateStore";
import { GET_ORG_TAGS } from "graphql/query/DocumentQuery";
import { handleError } from "graphql/ApolloClient";

interface Props {
  isModal?: boolean;
  currentDocumentId?: string;
}

const DocumentTemplate: React.FC<Props> = ({ isModal = false, currentDocumentId }) => {
  const addTags = useDocumentTemplateStore((state) => state.addTags);
  const resetTemplateData = useDocumentTemplateStore((state) => state.reset);
  const selectedTemplateType = useDocumentTemplateStore(
    (state) => state.openTemplateType,
  );
  const setSelectedTemplateType = useDocumentTemplateStore(
    (state) => state.setOpenTemplateType,
  );
  const setSelectedTemplateId = useDocumentTemplateStore(
    (state) => state.setSelectedPreviewTemplateId,
  );
  const [selectedCategory, setSelectedCategory] = useState<
    IDocumentCategory | undefined
  >();
  useQuery<GetOrgTags>(GET_ORG_TAGS, {
    onError: handleError,
    onCompleted: (data) => {
      addTags(cloneDeep(data).orgGetTags.map((t) => t.name));
    },
  });

  useEffect(() => {
    return () => {
      resetTemplateData();
    };
  }, []);

  return (
    <div style={{ display: "flex", height: isModal ? "" : "100%" }}>
      <LeftTemplateSide
        onChangeSelectedTemplateType={setSelectedTemplateType}
        selectedTemplateType={selectedTemplateType}
        selectedCategory={selectedCategory}
        onChangeSelectedCategory={(category) => {
          setSelectedCategory(category);
          setSelectedTemplateId(undefined);
        }}
        isModal={isModal}
      />
      <RightTemplateSide
        selectedCategory={selectedCategory}
        selectedTemplateType={selectedTemplateType}
        isModal={isModal}
        currentDocumentId={currentDocumentId}
      />
    </div>
  );
};

export default DocumentTemplate;
