// import original module declarations
import { ThemeConfig } from "antd";
import "styled-components";
import theme from "styles/theme/defaultTheme";

interface CustomTheme extends ThemeConfig {
  name: string;
  colors: any
};

declare module "styled-components" {
  interface DefaultTheme extends CustomTheme {}
}
