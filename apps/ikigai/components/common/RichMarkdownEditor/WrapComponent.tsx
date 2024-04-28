import { ApolloProvider } from "@apollo/client";
import { getApolloClient } from "graphql/ApolloClient";
import React from "react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "locales/en/messages";
import { ThemeProvider } from "styled-components";
import theme from "styles/theme/defaultTheme";
import GrowthBookWrapper from "components/GrowthBookProvider";

export interface WrapComponentProps {
  children?: React.ReactNode;
}

i18n.load({
  en: enMessages,
});

i18n.activate("en");

export const WrapComponent: React.FC<WrapComponentProps> = ({ children }) => {
  return (
    <ApolloProvider client={getApolloClient()}>
      <I18nProvider i18n={i18n}>
        <GrowthBookWrapper>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </GrowthBookWrapper>
      </I18nProvider>
    </ApolloProvider>
  );
};
