import { useMutation } from "@apollo/client";
import { AddDocumentStandalone, DocumentType, IconType } from "graphql/types";
import { ADD_DOCUMENT_STANDALONE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "store/DocumentStore";
import useSpaceStore from "store/SpaceStore";

const useCreateDocument = (parentId?: string) => {
  const [createStandaloneDocument, { loading }] =
    useMutation<AddDocumentStandalone>(ADD_DOCUMENT_STANDALONE, {
      onError: handleError,
    });
  const addSpaceDocument = useDocumentStore((state) => state.addSpaceDocument);
  const spaceId = useSpaceStore((state) => state.spaceId);

  const onCreate = async (docType: DocumentType) => {
    const isAssignment = docType === DocumentType.ASSIGNMENT;
    const { data } = await createStandaloneDocument({
      variables: {
        data: {
          title: "",
          parentId,
          iconType: IconType.EMOJI,
          iconValue: isAssignment ? "✏️" : "📂",
        },
        spaceId,
        isAssignment,
      },
    });

    if (data) {
      addSpaceDocument(data.documentCreate);
    }

    return data;
  };

  return {
    onCreate,
    loading,
  };
};

export default useCreateDocument;
