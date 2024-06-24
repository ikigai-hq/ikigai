import React, { ReactElement, ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import Head from "next/head";
import { Theme } from "@radix-ui/themes";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { useApollo } from "graphql/ApolloClient";
import IkigaiToaster from "components/Toaster";
import ErrorBoundary from "../components/ErrorBoundary";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "../locales/en/messages";
import { Initializing } from "components/Initializing";
import SpaceSetting from "../components/SpaceSetting";
import Config from "config/Config";

require("../styles/globals.css");

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

  return (
    <Theme>
      <>
        <Head>
          <title>Ikigai - AI powered Open Assignment Platform!</title>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width, maximum-scale=1, user-scalable=no"
          />
          <meta name="theme-color" content="#ffffff" />
          <link rel="icon" href={"/favicon.ico"} />
        </Head>
        <IkigaiToaster />
        <ApolloProvider client={client}>
          <I18nProvider i18n={i18n}>
            <GoogleOAuthProvider clientId={Config.googleClientId}>
              <ErrorBoundary>
                <Initializing>
                  {getLayout(<Component {...pageProps} />)}
                  <SpaceSetting />
                </Initializing>
              </ErrorBoundary>
            </GoogleOAuthProvider>
          </I18nProvider>
        </ApolloProvider>
      </>
    </Theme>
  );
}

export default MyApp;
