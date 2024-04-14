import { useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";

import { handleError } from "graphql/ApolloClient";
import CategoryList, { SelectedCategoryProps } from "./CategoryList";
import Loading from "../../Loading";
import { GetOrgTemplateCategory, GetOrgTemplates } from "graphql/types";
import { GET_ORG_TEMPLATE_CATEGORY, GET_ORG_TEMPLATES } from "graphql/query/DocumentQuery";
import useDocumentTemplateStore from "../../../context/ZustandDocumentTemplateStore";
import useAuthUserStore from "../../../context/ZustandAuthStore";

const OrganizationCategoryList = (props: SelectedCategoryProps) => {
  const addTemplates = useDocumentTemplateStore(state => state.addTemplates);
  const addCategories = useDocumentTemplateStore(state => state.addCategories);
  const orgId = useAuthUserStore(state => state.orgId);
  const categories = useDocumentTemplateStore(
    state =>
      Array.from(state.categories.values())
        .filter(category => category.orgId === orgId)
  );

  const { loading } = useQuery<GetOrgTemplateCategory>(GET_ORG_TEMPLATE_CATEGORY, {
    onError: handleError,
    onCompleted: (data) => addCategories(cloneDeep(data.orgGetDocumentTemplateCategories)),
    fetchPolicy: "network-only",
  });
  const { loading: loadingTemplate} = useQuery<GetOrgTemplates>(GET_ORG_TEMPLATES, {
    onError: handleError,
    onCompleted: (data) => {
      addTemplates(cloneDeep(data.orgGetDocumentTemplates));
    },
    fetchPolicy: "network-only",
  });
  
  if (loading || loadingTemplate) return <Loading />;
  
  return <CategoryList
    categories={categories}
    isCommunity={false}
    {...props}
  />;
};

export default OrganizationCategoryList;
