import React from "react";
import { ConfigProvider, App } from "antd";
import { ThemeProvider } from "styled-components";
import theme from "./defaultTheme";

const { token, components } = theme;

const withTheme = (node: JSX.Element) => (
  <ThemeProvider theme={theme}>
    <ConfigProvider
      theme={{
        token,
        components
      }}
    >
      <App>
        {node}
      </App>
    </ConfigProvider>
  </ThemeProvider>
);

export default withTheme;
