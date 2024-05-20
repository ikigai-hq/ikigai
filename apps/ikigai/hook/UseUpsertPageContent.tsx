import { useMutation } from "@apollo/client";
import { ADD_ORG_UPDATE_PAGE_CONTENT } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { DocumentActionPermission, PageContentInput } from "../graphql/types";
import usePermission from "./UsePermission";
import usePageContentStore from "store/PageContentStore";

const useAddOrUpdatePageContent = (pageContentId: string, pageId: string) => {
  const allow = usePermission();
  const [addOrUpdate, { loading }] = useMutation(ADD_ORG_UPDATE_PAGE_CONTENT, {
    onError: handleError,
  });
  const pageContent = usePageContentStore((state) =>
    state.pageContents.find((content) => content.id === pageContentId),
  );
  const updatePageContent = usePageContentStore(
    (state) => state.updatePageContent,
  );

  const upsert = async (
    data: Partial<Omit<PageContentInput, "id" | "pageId">>,
  ) => {
    if (!allow(DocumentActionPermission.EDIT_DOCUMENT)) return;

    const pageContentInput: PageContentInput = {
      id: pageContentId,
      pageId,
      index: pageContent?.index || 1,
      body: pageContent?.body,
      ...data,
    };
    addOrUpdate({
      variables: {
        pageContent: pageContentInput,
      },
    });
    updatePageContent({
      id: pageContentId,
      pageId,
      ...data,
    });
  };

  return {
    upsert,
    loading,
  };
};

export default useAddOrUpdatePageContent;
