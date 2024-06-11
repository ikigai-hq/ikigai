import React from "react";
import { Theme } from "@radix-ui/themes";

const withTheme = (node: JSX.Element) => <Theme>{node}</Theme>;

export default withTheme;
