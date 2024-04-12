import { useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";

import { handleError } from "graphql/ApolloClient";
import CategoryList, { SelectedCategoryProps } from "./CategoryList";
import Loading from "../../Loading";
import { GetCommunityTemplateCategory, GetCommunityTemplates } from "graphql/types";
import { GET_COMMUNITY_TEMPLATE_CATEGORY, GET_COMMUNITY_TEMPLATES } from "graphql/query/DocumentQuery";
import useDocumentTemplateStore from "context/ZustandDocumentTemplateStore";

const CommunityCategoryList = (props: SelectedCategoryProps) => {
  const addTemplates = useDocumentTemplateStore(state => state.addTemplates);
  const addCategories = useDocumentTemplateStore(state => state.addCategories);
  const categories = useDocumentTemplateStore(
    state =>
      Array.from(state.categories.values())
        .filter(category => category.isCommunity)
  );
  const { loading } = useQuery<GetCommunityTemplateCategory>(GET_COMMUNITY_TEMPLATE_CATEGORY, {
    onError: handleError,
    onCompleted: (data) => {
      addCategories(cloneDeep(data.getCommunityDocumentTemplateCategories));
    },
    fetchPolicy: "network-only",
  });
  const { loading: templateLoading } = useQuery<GetCommunityTemplates>(
    GET_COMMUNITY_TEMPLATES, {
      onError: handleError,
      onCompleted: (data) => {
        addTemplates(cloneDeep(data.getCommunityDocumentTemplates));
      },
      fetchPolicy: "network-only",
  });
  
  if (loading || templateLoading) return <Loading />;
  
  return <CategoryList
    categories={categories}
    isCommunity
    {...props}
  />;
};

export default CommunityCategoryList;
