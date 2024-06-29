import { debounce } from "lodash";

import { ADD_ORG_UPDATE_PAGE_CONTENT } from "graphql/mutation/DocumentMutation";
import { mutate } from "graphql/ApolloClient";
import { DocumentActionPermission, PageContentInput } from "graphql/types";
import usePermission from "./UsePermission";
import usePageContentStore from "store/PageContentStore";
import { wrapAsyncDocumentSavingFn } from "store/DocumentStore";

const upsertPageContent = (
  pageContentId: string,
  data: Partial<Omit<PageContentInput, "id" | "pageId">>,
) => {
  const pageContent = usePageContentStore
    .getState()
    .pageContents.find((content) => content.id === pageContentId);
  if (!pageContent) return;

  const pageContentInput: PageContentInput = {
    id: pageContentId,
    pageId: pageContent.pageId,
    index: pageContent.index,
    body: pageContent.body,
    ...data,
  };
  wrapAsyncDocumentSavingFn(mutate)(
    {
      mutation: ADD_ORG_UPDATE_PAGE_CONTENT,
      variables: {
        pageContent: pageContentInput,
      },
    },
    false,
  );
};

export const debouncedUpsertPageContent = debounce(upsertPageContent, 300);

const useAddOrUpdatePageContent = (pageContentId: string, pageId: string) => {
  const allow = usePermission();
  const updatePageContent = usePageContentStore(
    (state) => state.updatePageContent,
  );

  const upsert = async (
    data: Partial<Omit<PageContentInput, "id" | "pageId">>,
  ) => {
    if (
      !allow(DocumentActionPermission.EDIT_DOCUMENT) ||
      !allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)
    )
      return;

    upsertPageContent(pageContentId, data);
    updatePageContent({
      id: pageContentId,
      pageId,
      ...data,
    });
  };

  return {
    upsert,
  };
};

export default useAddOrUpdatePageContent;
