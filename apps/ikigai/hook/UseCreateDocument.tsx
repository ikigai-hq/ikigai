import { useMutation } from "@apollo/client";
import {
  AddDocumentStandaloneV2,
  DocumentType,
  IconType,
} from "../graphql/types";
import { ADD_DOCUMENT_STANDALONE_V2 } from "../graphql/mutation/DocumentMutation";
import { handleError } from "../graphql/ApolloClient";
import useDocumentStore from "../store/DocumentStore";
import useSpaceStore from "../store/SpaceStore";

const useCreateDocument = (parentId?: string) => {
  const [createStandaloneDocument, { loading }] =
    useMutation<AddDocumentStandaloneV2>(ADD_DOCUMENT_STANDALONE_V2, {
      onError: handleError,
    });
  const documents = useDocumentStore((state) => state.spaceDocuments);
  const addSpaceDocument = useDocumentStore((state) => state.addSpaceDocument);
  const spaceId = useSpaceStore((state) => state.spaceId);

  const onCreate = async (docType: DocumentType) => {
    const indexes = documents
      .filter((doc) => !doc.deletedAt)
      .filter((doc) => doc.parentId === parentId)
      .map((doc) => doc.index);
    const index = indexes.length ? Math.max(...indexes) + 1 : 1;

    const isAssignment = docType === DocumentType.ASSIGNMENT;
    const { data } = await createStandaloneDocument({
      variables: {
        data: {
          title: "Untitled",
          index,
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
