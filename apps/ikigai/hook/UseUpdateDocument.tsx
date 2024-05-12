import { useMutation } from "@apollo/client";

import { DocumentActionPermission, UpdateDocumentData } from "graphql/types";
import { UPDATE_DOCUMENT } from "graphql/mutation/SpaceMutation";
import { handleError } from "graphql/ApolloClient";
import useDocumentStore from "context/DocumentV2Store";
import usePermission from "./UsePermission";

const UseUpdateDocument = () => {
  const allow = usePermission();
  const [updateDocumentServer] = useMutation(UPDATE_DOCUMENT, {
    onError: handleError,
  });
  const activeDocument = useDocumentStore((state) => state.activeDocument);

  return (data: Partial<UpdateDocumentData>) => {
    if (!allow(DocumentActionPermission.EDIT_DOCUMENT)) return;

    const updateDocumentData: UpdateDocumentData = {
      title: activeDocument.title,
      coverPhotoId: activeDocument.coverPhotoId,
      editorConfig: activeDocument.editorConfig,
      body: activeDocument.body,
      iconType: activeDocument.iconType,
      iconValue: activeDocument.iconValue,
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
