import {
  DividerGroup,
  EmbedGroup,
  ExtensionName,
  ListGroup,
  NoticeGroup,
  PageLayoutGroup,
  ParentBlockMenu,
  QuizzGroup,
  RecordGroup,
  TextGroup,
  UploadGroup,
  blockMenuInfo,
} from "../types/extensions.enum";
import React from "react";
import {
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading1Icon,
  NormalTextIcon,
  QuoteIcon,
  OrderedListIcon,
  TodoListIcon,
  BorderTableIcon,
  DividerIcon,
  PageBreakIcon,
  InfoNoticeIcon,
  WarningNoticeIcon,
  TipNoticeIcon,
  SingleChoiceIcon,
  MultipleChoiceIcon,
  FillInBlankFreeTextIcon,
  AudioIcon,
  VideoIcon,
  FileUploadIcon,
  EmbedLinkIcon,
  BulletedListIcon,
  SplitPageIcon,
  FormOutlined,
  SinglePageIcon,
} from "./icons";

export interface IMappingBlockGroupItemValue {
  icon: React.ReactNode;
  name?: string;
  extensionName?: string;
  schemaType?: "nodes" | "marks";
  attrs?: Record<string, any>;
  shortcut?: string;
  component?: React.ReactNode;
  description?: string;
}

export interface GroupBlockItem {
  name: string;
  children?: IMappingBlockGroupItemValue[];
}

export const mappingTextGroup: {
  [key in TextGroup]?: IMappingBlockGroupItemValue;
} = {
  [TextGroup.H1]: {
    icon: <Heading1Icon />,
    description: "Big section heading",
    extensionName: ExtensionName.Heading,
    schemaType: "nodes",
    attrs: blockMenuInfo["Heading 1"]?.attrs,
    shortcut: blockMenuInfo["Heading 1"]?.shortcut,
  },
  [TextGroup.H2]: {
    icon: <Heading2Icon />,
    description: "Mid-medium section heading",
    extensionName: ExtensionName.Heading,
    schemaType: "nodes",
    attrs: blockMenuInfo["Heading 2"]?.attrs,
    shortcut: blockMenuInfo["Heading 2"]?.shortcut,
  },
  [TextGroup.H3]: {
    icon: <Heading3Icon />,
    description: "Medium section heading",
    extensionName: ExtensionName.Heading,
    schemaType: "nodes",
    attrs: blockMenuInfo["Heading 3"]?.attrs,
    shortcut: blockMenuInfo["Heading 3"]?.shortcut,
  },
  [TextGroup.H4]: {
    icon: <Heading4Icon />,
    description: "Small section heading",
    extensionName: ExtensionName.Heading,
    schemaType: "nodes",
    attrs: blockMenuInfo["Heading 4"]?.attrs,
    shortcut: blockMenuInfo["Heading 4"]?.shortcut,
  },
  [TextGroup.NText]: {
    icon: <NormalTextIcon />,
    description: "Just start writing with plain text",
    extensionName: ExtensionName.Paragraph,
    schemaType: "nodes",
  },
  [TextGroup.Quote]: {
    icon: <QuoteIcon />,
    description: "Capture a quote",
    extensionName: ExtensionName.Blockquote,
    schemaType: "nodes",
    attrs: blockMenuInfo.Quote?.attrs,
    shortcut: blockMenuInfo.Quote?.shortcut,
  },
  [TextGroup.TableOfContent]: {
    icon: <TodoListIcon />,
    extensionName: ExtensionName.CommonZenBlock,
    attrs: blockMenuInfo["Table Of Content"]?.attrs,
  },
};

const mappingListGroup: { [key in ListGroup]: IMappingBlockGroupItemValue } = {
  [ListGroup.Bulleted]: {
    icon: <BulletedListIcon />,
    extensionName: ExtensionName.BulletedList,
    attrs: blockMenuInfo["Bulleted List"]?.attrs,
    shortcut: blockMenuInfo["Bulleted List"]?.shortcut,
  },
  [ListGroup.Ordered]: {
    icon: <OrderedListIcon />,
    extensionName: ExtensionName.OrderedList,
    attrs: blockMenuInfo["Ordered List"]?.attrs,
    shortcut: blockMenuInfo["Ordered List"]?.shortcut,
  },
  [ListGroup.Todo]: {
    icon: <TodoListIcon />,
    extensionName: ExtensionName.CheckboxList,
    attrs: blockMenuInfo["Todo List"]?.attrs,
    shortcut: blockMenuInfo["Todo List"]?.shortcut,
  },
};

const mappingPageLayoutGroup: {
  [key in PageLayoutGroup]: IMappingBlockGroupItemValue;
} = {
  [PageLayoutGroup.SinglePage]: {
    icon: <SinglePageIcon />,
    extensionName: ExtensionName.PageBlock,
    attrs: blockMenuInfo["Single Page"]?.attrs,
  },
  [PageLayoutGroup.SplitPage]: {
    icon: <SplitPageIcon />,
    extensionName: ExtensionName.PageBlock,
    attrs: blockMenuInfo["Split Page"]?.attrs,
    shortcut: blockMenuInfo["Split Page"]?.shortcut,
  },
};

const mappingDividerGroup: {
  [key in DividerGroup]: IMappingBlockGroupItemValue;
} = {
  [DividerGroup.Divider]: {
    icon: <DividerIcon />,
    extensionName: ExtensionName.Divider,
    attrs: blockMenuInfo.Divider?.attrs,
    shortcut: blockMenuInfo.Divider?.shortcut,
  },
  [DividerGroup.PageBreak]: {
    extensionName: ExtensionName.Divider,
    attrs: blockMenuInfo["Page Break"]?.attrs,
    shortcut: blockMenuInfo["Page Break"]?.shortcut,
    icon: <PageBreakIcon />,
  },
};

const mappingNoticeGroup: {
  [key in NoticeGroup]?: IMappingBlockGroupItemValue;
} = {
  [NoticeGroup.Info]: {
    icon: <InfoNoticeIcon />,
    extensionName: ExtensionName.Notice,
    attrs: blockMenuInfo.Info?.attrs,
    shortcut: blockMenuInfo.Info?.shortcut,
  },
  [NoticeGroup.Warning]: {
    extensionName: ExtensionName.Notice,
    attrs: blockMenuInfo.Warning?.attrs,
    shortcut: blockMenuInfo.Warning?.shortcut,
    icon: <WarningNoticeIcon />,
  },
  [NoticeGroup.Tip]: {
    extensionName: ExtensionName.Notice,
    attrs: blockMenuInfo.Tip?.attrs,
    shortcut: blockMenuInfo.Tip?.shortcut,
    icon: <TipNoticeIcon />,
  },
};

const mappingQuizzGroup: {
  [key in QuizzGroup]?: IMappingBlockGroupItemValue;
} = {
  [QuizzGroup.Single]: {
    extensionName: ExtensionName.Quizz,
    icon: <SingleChoiceIcon />,
    attrs: blockMenuInfo["Single Choice"]?.attrs,
    shortcut: blockMenuInfo["Single Choice"]?.shortcut,
  },
  [QuizzGroup.Multiple]: {
    extensionName: ExtensionName.Quizz,
    icon: <MultipleChoiceIcon />,
    attrs: blockMenuInfo["Multiple Choice"]?.attrs,
    shortcut: blockMenuInfo["Multiple Choice"]?.shortcut,
  },
  [QuizzGroup.FillInFree]: {
    extensionName: ExtensionName.FillInBlank,
    icon: <FillInBlankFreeTextIcon />,
    attrs: blockMenuInfo["Fill in Blank: Free Text"]?.attrs,
    shortcut: blockMenuInfo["Fill in Blank: Free Text"]?.shortcut,
  },
  [NoticeGroup.Writing]: {
    extensionName: ExtensionName.Notice,
    attrs: blockMenuInfo.Writing?.attrs,
    shortcut: blockMenuInfo.Writing?.shortcut,
    icon: <FormOutlined />,
  },
};

// const mappingDataChartGroup: {
//   [key in DataChartGroup]: IMappingBlockGroupItemValue;
// } = {
//   [DataChartGroup.ClassGrade]: {
//     extensionName: ExtensionName.Grade,
//     icon: <GradeChartIcon />,
//     attrs: blockMenuInfo["Class Grade Chart"]?.attrs,
//     shortcut: blockMenuInfo["Class Grade Chart"]?.shortcut,
//   },
//   [DataChartGroup.Rating]: {
//     extensionName: ExtensionName.Rating,
//     icon: <RatingIcon />,
//     attrs: blockMenuInfo.Rating?.attrs,
//     shortcut: blockMenuInfo.Rating?.shortcut,
//   },
// };

const mappingRecordGroup: {
  [key in RecordGroup]: IMappingBlockGroupItemValue;
} = {
  [RecordGroup.Audio]: {
    extensionName: ExtensionName.Audio,
    icon: <AudioIcon />,
    attrs: blockMenuInfo["Audio Record"]?.attrs,
    shortcut: blockMenuInfo["Audio Record"]?.shortcut,
  },
  [RecordGroup.Video]: {
    extensionName: ExtensionName.Video,
    icon: <VideoIcon />,
    attrs: blockMenuInfo["Video Record"]?.attrs,
    shortcut: blockMenuInfo["Video Record"]?.shortcut,
  },
};

const mappingUploadGroup: {
  [key in UploadGroup]: IMappingBlockGroupItemValue;
} = {
  [UploadGroup.FromComputer]: {
    extensionName: ExtensionName.File,
    icon: <FileUploadIcon />,
    attrs: blockMenuInfo["From Computer"]?.attrs,
    shortcut: blockMenuInfo["From Computer"]?.shortcut,
  },
};

const mappingEmbedGroup: {
  [key in EmbedGroup]: IMappingBlockGroupItemValue;
} = {
  [EmbedGroup.EmbedLink]: {
    extensionName: ExtensionName.CommonEmbed,
    icon: <EmbedLinkIcon />,
    attrs: blockMenuInfo["Embed Link"]?.attrs,
    shortcut: blockMenuInfo["Embed Link"]?.shortcut,
  },
  // [EmbedGroup.Youtube]: {
  //   icon: <YoutubeIcon />,
  // },
};

export const defaultMenu: { [key in ParentBlockMenu]?: GroupBlockItem } = {
  [ParentBlockMenu.Text]: {
    name: ParentBlockMenu.Text,
    children: Object.keys(mappingTextGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingTextGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
  [ParentBlockMenu.List]: {
    name: ParentBlockMenu.List,
    children: Object.keys(mappingListGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingListGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
  [ParentBlockMenu.PageLayout]: {
    name: ParentBlockMenu.PageLayout,
    children: Object.keys(mappingPageLayoutGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingPageLayoutGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
  [ParentBlockMenu.Divider]: {
    name: ParentBlockMenu.Divider,
    children: Object.keys(mappingDividerGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingDividerGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
  [ParentBlockMenu.Table]: {
    name: ParentBlockMenu.Table,
    children: [
      {
        name: "Dynamic Table",
        extensionName: ExtensionName.Table,
        icon: <BorderTableIcon />,
        attrs: { rowsCount: 3, colsCount: 3 },
      },
    ],
  },
  [ParentBlockMenu.Notice]: {
    name: ParentBlockMenu.Notice,
    children: Object.keys(mappingNoticeGroup).map((m) => {
      const {
        icon,
        shortcut,
        attrs,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingNoticeGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
  [ParentBlockMenu.Quizz]: {
    name: ParentBlockMenu.Quizz,
    children: Object.keys(mappingQuizzGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingQuizzGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
  [ParentBlockMenu.Record]: {
    name: ParentBlockMenu.Record,
    children: Object.keys(mappingRecordGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
        component,
      }: IMappingBlockGroupItemValue = mappingRecordGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
        component,
      };
    }),
  },
  [ParentBlockMenu.Upload]: {
    name: ParentBlockMenu.Upload,
    children: Object.keys(mappingUploadGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingUploadGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
  [ParentBlockMenu.Embed]: {
    name: ParentBlockMenu.Embed,
    children: Object.keys(mappingEmbedGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingEmbedGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
};
