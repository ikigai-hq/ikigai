import create from "zustand";
import { cloneDeep } from "lodash";

import {
  GetDocumentV2,
  GetDocumentV2_documentGet as IDocument,
} from "graphql/types";
import { useLazyQuery } from "@apollo/client";
import { GET_DOCUMENT_V2 } from "../graphql/query/DocumentQuery";
import { useEffect, useState } from "react";

type IDocumentStore = {
  activeDocumentId?: string;
  activeDocument?: IDocument;
  setActiveDocument: (activeDocument: IDocument) => void;
};

const useDocumentStore = create<IDocumentStore>((set, _get) => ({
  activeDocumentId: undefined,
  activeDocument: undefined,
  setActiveDocument: (activeDocument) => {
    set({
      activeDocumentId: activeDocument.id,
      activeDocument: cloneDeep(activeDocument),
    });
  },
}));

export const useLoadDocument = (documentId: string) => {
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | undefined>();

  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const setActiveDocument = useDocumentStore(
    (state) => state.setActiveDocument,
  );

  const [fetchDocument] = useLazyQuery<GetDocumentV2>(GET_DOCUMENT_V2, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (activeDocument?.id != documentId) {
      load();
    }
  }, [documentId]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await fetchDocument({
      variables: {
        documentId,
      },
    });

    if (data) {
      setActiveDocument(data.documentGet);
    }

    if (error) {
      setLoadingError(error.message);
    }
    setLoading(false);
  };

  return {
    loading,
    loadingError,
    activeDocument,
  };
};

export default useDocumentStore;
