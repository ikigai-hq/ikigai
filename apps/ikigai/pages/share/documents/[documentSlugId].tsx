import React from "react";

import useDocumentStore from "context/ZustandDocumentStore";
import { parsePublicDocumentUrl } from "config/Routes";
import Head from "next/head";
import {
  GetDocumentDetailByUUID,
  GetDocumentDetail_documentGet as IDocument,
} from "graphql/types";
import { query } from "graphql/ApolloClient";
import { GET_DOCUMENT_DETAIL_BY_UUID } from "graphql/query/DocumentQuery";
import dynamic from "next/dynamic";
import { GetServerSidePropsContext } from "next";

const PublicDocumentNoSSR = dynamic(
  () => import("components/Document/PublicDocument"),
  {
    ssr: false,
  },
);

interface IProps {
  data: IDocument;
}

export default function DocumentPage({ data }: IProps) {
  const setActiveDocument = useDocumentStore(
    (state) => state.setMasterDocument,
  );
  setActiveDocument(data as any);

  return (
    <>
      <Head>
        <title>{data?.title || "ikigai"}</title>
        <meta property="og:title" content={data?.title || "ikigai"} />
        <meta property="og:image" content={data?.coverPhotoUrl} />
        <meta property="og:description" content={data?.title} />

        <meta name="twitter:title" content={data?.title || "ikigai"} />
        <meta name="twitter:image" content={data?.coverPhotoUrl} />
        <meta name="twitter:description" content={data?.title} />
      </Head>
      <PublicDocumentNoSSR />
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { documentSlugId } = ctx.params;
  const data = await query<GetDocumentDetailByUUID>(
    {
      query: GET_DOCUMENT_DETAIL_BY_UUID,
      variables: {
        documentUuid: parsePublicDocumentUrl(documentSlugId as string),
      },
    },
    true,
  );
  return { props: { data: data.documentGet } };
}
