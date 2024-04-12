const SSR = typeof window === "undefined";
export const isMac = !SSR && window.navigator.userAgent.includes("Mac");
export const mod = isMac ? "⌘" : "ctrl";

export enum ParentBlockMenu {
  Text = "Text",
  List = "List",
  PageLayout = "Page Layout",
  Divider = "Divider",
  Table = "Table",
  Columns = "Columns",
  Notice = "Notice",
  Quizz = "Quizz",
  Record = "Record",
  Upload = "Upload",
  Embed = "Embed",
}

export enum TextGroup {
  NText = "Normal Text",
  Title = "Title",
  Subtitle = "Subtitle",
  H1 = "Heading 1",
  H2 = "Heading 2",
  H3 = "Heading 3",
  H4 = "Heading 4",
  Quote = "Quote",
  TableOfContent = "Table Of Content",
}

export enum ListGroup {
  Bulleted = "Bulleted List",
  Ordered = "Ordered List",
  Todo = "Todo List",
}

export enum PageLayoutGroup {
  SplitPage = "Split Page",
  SinglePage = "Single Page",
}

export enum DividerGroup {
  Divider = "Divider",
  PageBreak = "Page Break",
}

export enum NoticeGroup {
  Info = "Info",
  Warning = "Warning",
  Tip = "Tip",
  Writing = "Writing",
}

export enum CalloutType {
  Info = "info",
  Warning = "warning",
  Tip = "tip",
  Writing = "writing",
}

export enum QuizzGroup {
  Single = "Single Choice",
  Multiple = "Multiple Choice",
  FillInFree = "Fill in Blank: Free Text",
  FillInSelect = "Fill in Blank: Select",
  Writing = "Writing",
}

export enum QuizType {
  FILL_IN_BLANK = "FILL_IN_BLANK",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  SELECT_OPTION = "SELECT_OPTION",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  SPEAKING_QUIZ = "SPEAKING_QUIZ",
  WRITING_QUIZ = "WRITING_QUIZ",
}

export enum RecordGroup {
  Audio = "Audio Record",
  Video = "Video Record",
}

export enum UploadGroup {
  FromComputer = "From Computer",
}

export enum EmbedGroup {
  EmbedLink = "Embed Link",
  // Youtube = "Youtube",
}

export enum InlineTextGroup {
  Bold = "Bold",
  Italic = "Italic",
  Underline = "Underline",
  Strikethrough = "Strikethrough",
  ReplaceText = "Replace Text",
  Annotation = "Highlight and comments",
  EmbedLink = "Embed link",
  TodoList = "Track tasks with a to-do list",
  OrderedList = "Create a list with numbering",
  BulletedList = "Create a simple bulleted list",
  TextColor = "Text color",
  HighlightText = "Highlight text",
}

export enum ZenNodeType {
  TableOfContent = "tableOfContent",
}

export enum ExtensionName {
  // H1, H2, H3
  Heading = "heading",
  Paragraph = "paragraph",
  CheckboxList = "checkbox_list",
  BulletedList = "bullet_list",
  OrderedList = "ordered_list",
  Blockquote = "blockquote",
  Table = "table",
  // Divider, Page break.
  Divider = "hr",
  Link = "link",
  // Info, warning, tip.
  Notice = "container_notice",
  File = "file_block",
  Quizz = "quiz_block",
  FillInBlank = "fill_in_blank",
  Grade = "score_block",
  Rating = "rating_block",
  Audio = "record_audio_block",
  Video = "record_video_block",
  CommonEmbed = "common_embed_block",
  Bold = "strong",
  Italic = "em",
  Underline = "underline",
  Strikethrough = "strikethrough",
  FeedbackText = "feedback_text",
  TextColor = "colorText",
  Annotation = "annotation",
  PageBlock = "page_block",
  CommonZenBlock = "common_zenblock",
  HighlightText = "highlight",
}

type GroupTypeKey =
  | TextGroup
  | ListGroup
  | PageLayoutGroup
  | DividerGroup
  | NoticeGroup
  | QuizzGroup
  | RecordGroup
  | UploadGroup
  | EmbedGroup;

export const blockMenuInfo: {
  [key in GroupTypeKey]?: {
    shortcut?: string;
    attrs?: Record<string, any>;
  };
} = {
  [TextGroup.H1]: {
    shortcut: "^+⇧+1",
    attrs: { level: 1 },
  },
  [TextGroup.H2]: {
    shortcut: "^ ⇧ 2",
    attrs: { level: 2 },
  },
  [TextGroup.H3]: {
    shortcut: "^ ⇧ 3",
    attrs: { level: 3 },
  },
  [TextGroup.H4]: {
    shortcut: "^ ⇧ 4",
    attrs: { level: 4 },
  },
  [TextGroup.Quote]: {
    shortcut: `${mod}+]`,
  },
  [TextGroup.TableOfContent]: {
    attrs: { zenNodeType: ZenNodeType.TableOfContent },
  },
  [ListGroup.Bulleted]: {
    shortcut: "^ ⇧ 8",
  },
  [ListGroup.Ordered]: {
    shortcut: "^ ⇧ 9",
  },
  [ListGroup.Todo]: {
    shortcut: "^ ⇧ 7",
  },
  [PageLayoutGroup.SplitPage]: {
    shortcut: "{pb",
  },
  [PageLayoutGroup.SinglePage]: {
    attrs: { type: "single" },
  },
  [DividerGroup.Divider]: {
    shortcut: `${mod}+_`,
  },
  [DividerGroup.PageBreak]: {
    shortcut: "***",
  },
  [NoticeGroup.Info]: {
    attrs: { style: CalloutType.Info },
  },
  [NoticeGroup.Warning]: {
    attrs: { style: CalloutType.Warning },
  },
  [NoticeGroup.Tip]: {
    attrs: { style: CalloutType.Tip },
  },
  [NoticeGroup.Writing]: {
    attrs: { style: CalloutType.Writing },
  },
  [QuizzGroup.Single]: {
    shortcut: "{q",
    attrs: { quizzType: QuizType.SINGLE_CHOICE },
  },
  [QuizzGroup.Multiple]: {
    shortcut: "{q",
    attrs: { quizzType: QuizType.MULTIPLE_CHOICE },
  },
  [QuizzGroup.FillInFree]: {
    shortcut: "{bl",
  },
  [RecordGroup.Audio]: {
    shortcut: "{ra",
  },
  [RecordGroup.Video]: {
    shortcut: "{rv",
  },
  [UploadGroup.FromComputer]: {
    shortcut: "{f",
  },
  [EmbedGroup.EmbedLink]: {
    shortcut: "{em",
  },
};

export const InlineTextMenuInfo: {
  [key in ExtensionName]?: {
    extensionName: ExtensionName;
    shortcut?: string;
    attrs?: Record<string, any>;
  };
} = {
  [ExtensionName.Bold]: {
    extensionName: ExtensionName.Bold,
    shortcut: `${mod}+b`,
  },
  [ExtensionName.Italic]: {
    extensionName: ExtensionName.Italic,
    shortcut: `${mod}+i`,
  },
  [ExtensionName.Underline]: {
    extensionName: ExtensionName.Underline,
    shortcut: `${mod}+u`,
  },
  [ExtensionName.Strikethrough]: {
    extensionName: ExtensionName.Strikethrough,
    shortcut: `${mod}+d`,
  },
  [ExtensionName.FeedbackText]: {
    extensionName: ExtensionName.FeedbackText,
    shortcut: isMac ? "Control+d" : "Alt+s",
  },
  [ExtensionName.TextColor]: {
    extensionName: ExtensionName.TextColor,
  },
  [ExtensionName.Link]: {
    extensionName: ExtensionName.Link,
    shortcut: `${mod}+k`,
  },
  [ExtensionName.Annotation]: {
    extensionName: ExtensionName.Annotation,
  },
  [ExtensionName.FillInBlank]: {
    extensionName: ExtensionName.FillInBlank,
    shortcut: "{bl",
  },
};
