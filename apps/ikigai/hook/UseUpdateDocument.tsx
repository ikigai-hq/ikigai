import { useMutation } from "@apollo/client";

import { UpdateDocumentData } from "graphql/types";
import { UPDATE_DOCUMENT } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "context/DocumentV2Store";

const UseUpdateDocument = () => {
  const [updateDocumentServer] = useMutation(UPDATE_DOCUMENT, {
    onError: handleError,
  });
  const activeDocument = useDocumentStore((state) => state.activeDocument);

  return (data: Partial<UpdateDocumentData>) => {
    const updateDocumentData: UpdateDocumentData = {
      title: activeDocument.title,
      coverPhotoId: activeDocument.coverPhotoId,
      editorConfig: activeDocument.editorConfig,
      body: activeDocument.body,
      ...data,
    };

    updateDocumentServer({
      variables: {
        documentId: activeDocument.id,
        data: updateDocumentData,
      },
    });
  };
};

export default UseUpdateDocument;
