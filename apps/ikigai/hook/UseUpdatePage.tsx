import { useMutation } from "@apollo/client";
import { ADD_OR_UPDATE_PAGE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { DocumentActionPermission, PageInput } from "graphql/types";
import usePageStore from "store/PageStore";
import usePermission from "./UsePermission";

const useUpdatePage = (pageId: string) => {
  const allow = usePermission();
  const page = usePageStore((state) =>
    state.pages.find((page) => page.id === pageId),
  );
  const addPage = usePageStore((state) => state.addPage);
  const [addOrUpdatePage, { loading }] = useMutation(ADD_OR_UPDATE_PAGE, {
    onError: handleError,
  });

  const upsert = async (
    data: Partial<Omit<PageInput, "id" | "documentId">>,
    isSinglePage?: boolean,
  ) => {
    if (!allow(DocumentActionPermission.EDIT_DOCUMENT)) return;

    const pageInput: PageInput = {
      id: pageId,
      documentId: page.documentId,
      index: page.index,
      title: page.title,
      layout: page.layout,
      ...data,
    };

    addOrUpdatePage({
      variables: {
        page: pageInput,
        isSinglePage,
      },
    });

    Object.assign(page, data);
    addPage(page);
  };

  return {
    upsert,
    loading,
  };
};

export default useUpdatePage;
