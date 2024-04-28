import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import useDocumentStore from "context/ZustandDocumentStore";
import Loading from "components/Loading";
import { useLoadDocument } from "../../../hook/UseLoadDocument";

const PreviewDocumentCSR = dynamic(
  () => import("components/Document/PreviewDocument"),
  {
    ssr: false,
  },
);

export default function DocumentPage() {
  const router = useRouter();
  const documentId = router.query.documentId as string;

  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const { loading } = useLoadDocument(documentId);

  if (loading || !activeDocument) return <Loading />;

  return <PreviewDocumentCSR doc={activeDocument} onlyWide />;
}
