import * as React from "react";
import { EditorState } from "prosemirror-state";

export enum HighlightType {
  NORMAL = "NORMAL",
  REPLACE = "REPLACE",
}

export enum ToastType {
  Error = "error",
  Info = "info",
}

export enum GroupBlock {
  Text = "Text",
  TextColor = "Text Color",
  BasicBlock = "Basic Blocks",
  Notice = "Notice",
  FileUpload = "File Upload",
  Quiz = "Quiz",
  Report = "Report",
  Media = "Media",
  RecordBlock = "Record Block",
  Embeds = "Embeds",
}

export type MenuItem = {
  group?: GroupBlock;
  textColor?: string;
  bgColor?: string;
  icon?: React.ReactNode;
  name?: string;
  title?: string;
  shortcut?: string;
  keywords?: string;
  tooltip?: string;
  defaultHidden?: boolean;
  attrs?: Record<string, any>;
  visible?: boolean;
  active?: (state: EditorState) => boolean;
  children?: MenuItem[];
};

export type EmbedDescriptor = MenuItem & {
  matcher: (url: string) => boolean | [] | RegExpMatchArray;
  component: typeof React.Component | React.FC<any>;
};

export enum EditorConfigType {
  DEFAULT = "Default",
  STYLE_SERIF = "Serif",
  STYLE_MONO = "Mono",
  SIZE_LARGE = "Large",
  WIDTH_STANDARD = "Standard",
  WIDTH_WIDE = "Wide",
}
