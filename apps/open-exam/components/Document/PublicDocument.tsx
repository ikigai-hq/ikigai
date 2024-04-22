import React from "react";

import { isUndefined } from "lodash";
import Loading from "components/Loading";
import useDocumentStore from "context/ZustandDocumentStore";
import PreviewDocument from "./PreviewDocument";

const PublicDocument = () => {
  const masterDocument = useDocumentStore((state) => state.masterDocument);

  if (isUndefined(masterDocument)) {
    return <Loading />;
  }

  return <PreviewDocument doc={masterDocument} />;
};

export default PublicDocument;
