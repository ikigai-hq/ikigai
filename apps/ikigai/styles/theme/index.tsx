import React from "react";
import { ConfigProvider, App } from "antd";
import { ThemeProvider } from "styled-components";
import theme from "./defaultTheme";
import { Theme } from "@radix-ui/themes";

const { token, components } = theme;

const withTheme = (node: JSX.Element) => (
  <ThemeProvider theme={theme}>
    <ConfigProvider
      theme={{
        token,
        components,
      }}
    >
      <App>
        <Theme>{node}</Theme>
      </App>
    </ConfigProvider>
  </ThemeProvider>
);

export default withTheme;
