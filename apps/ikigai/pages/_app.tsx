import React, { ReactElement, ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import Head from "next/head";

import { useApollo } from "../graphql/ApolloClient";
import IkigaiToaster from "components/Toaster";
import ErrorBoundary from "../components/ErrorBoundary";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "../locales/en/messages";
import withTheme from "styles/theme";
import { Initializing } from "../components/Initializing";
import SpaceSetting from "../components/SpaceSetting";
import useDocumentStore from "store/DocumentStore";

require("../styles/globals.less");

i18n.load({
  en: enMessages,
});

i18n.activate("en");
interface PageProps {
  initialApolloState: any;
}

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout<PageProps>;
  pageProps: PageProps;
};

const formatFavicon = (icon: string) =>
  `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${icon}</text></svg>`;

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const client = useApollo(pageProps.initialApolloState);
  const getLayout = Component.getLayout ?? ((page) => page);

  const iconValue = useDocumentStore(
    (state) => state.activeDocument?.iconValue,
  );
  const isFolder = useDocumentStore((state) => state.isFolder);
  const icon = !isFolder ? iconValue || "✏️" : "📁";

  return withTheme(
    <>
      <Head>
        <title>Ikigai - AI powered Open Assignment Platform!</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href={formatFavicon(icon)} />
      </Head>
      <IkigaiToaster />
      <ApolloProvider client={client}>
        <I18nProvider i18n={i18n}>
          <ErrorBoundary>
            <Initializing>
              {getLayout(<Component {...pageProps} />)}
              <SpaceSetting />
            </Initializing>
          </ErrorBoundary>
        </I18nProvider>
      </ApolloProvider>
    </>,
  );
}

export default MyApp;
