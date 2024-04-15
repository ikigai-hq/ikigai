import React, { ReactElement, ReactNode, useEffect } from "react";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import Head from "next/head";

import { useApollo } from "../graphql/ApolloClient";
import OpenExamToaster from "components/Toaster";
import ErrorBoundary from "../components/ErrorBoundary";
import GrowthBookWrapper from "components/GrowthBookProvider";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "../locales/en/messages";
import withTheme from "styles/theme";
import { initMixpanel } from "../util/track";
import DocumentTemplateModal from "components/DocumentTemplate/DocumentTemplateModal";
import { Initializing } from "../components/Initializing";

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

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const client = useApollo(pageProps.initialApolloState);
  const getLayout = Component.getLayout ?? ((page) => page);

  useEffect(() => {
    initMixpanel();
  }, []);

  return withTheme(
    <>
      <Head>
        <title>Learning Platform - Teach your way!</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <OpenExamToaster />
      <ApolloProvider client={client}>
        <I18nProvider i18n={i18n}>
          <GrowthBookWrapper>
            <ErrorBoundary>
              <Initializing>
                {getLayout(<Component {...pageProps} />)}
                <DocumentTemplateModal />
              </Initializing>
            </ErrorBoundary>
          </GrowthBookWrapper>
        </I18nProvider>
      </ApolloProvider>
    </>,
  );
}

export default MyApp;
