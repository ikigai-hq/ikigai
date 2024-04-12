/* eslint-disable @next/next/no-img-element */
import {
  AudioOutlined,
  InfoCircleOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import {
  BorderTableIcon,
  BulletedIcon,
  BulletedListIcon,
  CheckDoneOutlineIcon,
  ComputerIcon,
  EmbedIcon,
  EmbedLinkIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ItalicTextIcon,
  ListBlockIcon,
  NormalTextIcon,
  OrderedListIcon,
  OrderedListMenuIcon,
  PageLayoutIcon,
  QuizzMenuIcon,
  QuoteIcon,
  RecordCircleIcon,
  RecordVideo,
  StrikethroughIcon,
  StrongTextIcon,
  TableMenuIcon,
  TodoListMenuIcon,
  UnderlineIcon,
  UploadIcon,
} from "components/common/IconSvg";
import {
  ParentBlockMenu,
  TextGroup,
  ListGroup,
  DividerGroup,
  NoticeGroup,
  QuizzGroup,
  RecordGroup,
  UploadGroup,
  EmbedGroup,
  ExtensionName,
  blockMenuInfo,
  InlineTextGroup,
  InlineTextMenuInfo,
  PageLayoutGroup,
} from "@zkls/editor/dist/types/extensions.enum";
import { Trans } from "@lingui/macro";
import { Text, TextWeight } from "components/common/Text";

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
  icon: React.ReactNode;
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
    attrs: blockMenuInfo["Heading 1"].attrs,
    shortcut: blockMenuInfo["Heading 1"].shortcut,
    component: (
      <Text weight={TextWeight.mediumlv2}>
        <Trans>{TextGroup.H1}</Trans>
      </Text>
    ),
  },
  [TextGroup.H2]: {
    icon: <Heading2Icon />,
    description: "Mid-medium section heading",
    extensionName: ExtensionName.Heading,
    schemaType: "nodes",
    attrs: blockMenuInfo["Heading 2"].attrs,
    shortcut: blockMenuInfo["Heading 2"].shortcut,
    component: (
      <Text weight={TextWeight.mediumlv2}>
        <Trans>{TextGroup.H2}</Trans>
      </Text>
    ),
  },
  [TextGroup.H3]: {
    icon: <Heading3Icon />,
    description: "Medium section heading",
    extensionName: ExtensionName.Heading,
    schemaType: "nodes",
    attrs: blockMenuInfo["Heading 3"].attrs,
    shortcut: blockMenuInfo["Heading 3"].shortcut,
    component: (
      <Text weight={TextWeight.mediumlv2}>
        <Trans>{TextGroup.H3}</Trans>
      </Text>
    ),
  },
  [TextGroup.H4]: {
    icon: <Heading4Icon />,
    description: "Small section heading",
    extensionName: ExtensionName.Heading,
    schemaType: "nodes",
    attrs: blockMenuInfo["Heading 4"].attrs,
    shortcut: blockMenuInfo["Heading 4"].shortcut,
    component: (
      <Text weight={TextWeight.mediumlv2}>
        <Trans>{TextGroup.H4}</Trans>
      </Text>
    ),
  },
  [TextGroup.NText]: {
    icon: <NormalTextIcon />,
    description: "Just start writing with plain text",
    extensionName: ExtensionName.Paragraph,
    schemaType: "nodes",
    component: (
      <Text>
        <Trans>{TextGroup.NText}</Trans>
      </Text>
    ),
  },
  [TextGroup.Quote]: {
    icon: <QuoteIcon />,
    description: "Capture a quote",
    extensionName: ExtensionName.Blockquote,
    schemaType: "nodes",
    attrs: blockMenuInfo.Quote.attrs,
    shortcut: blockMenuInfo.Quote.shortcut,
    component: (
      <Text weight={TextWeight.medium}>
        <Trans>&quot;{`${TextGroup.Quote}`}&quot;</Trans>
      </Text>
    ),
  },
  [TextGroup.TableOfContent]: {
    icon: (
      <img
        alt="blackboard"
        src="/table-of-contents.png"
        width={40}
        height={30}
      />
    ),
    extensionName: ExtensionName.CommonZenBlock,
    schemaType: "nodes",
    attrs: blockMenuInfo["Table Of Content"].attrs,
    shortcut: blockMenuInfo["Table Of Content"].shortcut,
  },
};

const mappingListGroup: { [key in ListGroup]: IMappingBlockGroupItemValue } = {
  [ListGroup.Bulleted]: {
    icon: <BulletedListIcon />,
    extensionName: ExtensionName.BulletedList,
    schemaType: "nodes",
    attrs: blockMenuInfo["Bulleted List"].attrs,
    shortcut: blockMenuInfo["Bulleted List"].shortcut,
  },
  [ListGroup.Ordered]: {
    icon: <OrderedListMenuIcon />,
    extensionName: ExtensionName.OrderedList,
    schemaType: "nodes",
    attrs: blockMenuInfo["Ordered List"].attrs,
    shortcut: blockMenuInfo["Ordered List"].shortcut,
  },
  [ListGroup.Todo]: {
    icon: <TodoListMenuIcon />,
    extensionName: ExtensionName.CheckboxList,
    schemaType: "nodes",
    attrs: blockMenuInfo["Todo List"].attrs,
    shortcut: blockMenuInfo["Todo List"].shortcut,
  },
};

const mappingPageLayoutGroup: {
  [key in PageLayoutGroup]: IMappingBlockGroupItemValue;
} = {
  [PageLayoutGroup.SinglePage]: {
    icon: (
      <img
        alt="single-page"
        src="/single-page-block.png"
        height={40}
        style={{ margin: "-8px 0" }}
      />
    ),
    extensionName: ExtensionName.PageBlock,
    attrs: blockMenuInfo["Single Page"]?.attrs,
  },
  [PageLayoutGroup.SplitPage]: {
    icon: (
      <img
        alt="split-page"
        src="/split-page.png"
        height={40}
        style={{ margin: "-8px 0" }}
      />
    ),
    extensionName: ExtensionName.PageBlock,
    attrs: blockMenuInfo["Split Page"]?.attrs,
    shortcut: blockMenuInfo["Split Page"]?.shortcut,
  },
};

const mappingDividerGroup: {
  [key in DividerGroup]: IMappingBlockGroupItemValue;
} = {
  [DividerGroup.Divider]: {
    icon: <MinusOutlined />,
    extensionName: ExtensionName.Divider,
    attrs: blockMenuInfo.Divider.attrs,
    shortcut: blockMenuInfo.Divider.shortcut,
  },
  [DividerGroup.PageBreak]: {
    extensionName: ExtensionName.Divider,
    attrs: blockMenuInfo["Page Break"].attrs,
    shortcut: blockMenuInfo["Page Break"].shortcut,
    icon: (
      <img
        src="/page-break.png"
        style={{ margin: "-8px 0" }}
        alt="page-break"
        width={78}
        height={56}
      />
    ),
  },
};

const mappingNoticeGroup: {
  [key in NoticeGroup]?: IMappingBlockGroupItemValue;
} = {
  [NoticeGroup.Info]: {
    icon: (
      <img src="/info-notice.png" alt="info-notice" width={102} height={24} />
    ),
    extensionName: ExtensionName.Notice,
    attrs: blockMenuInfo.Info.attrs,
    shortcut: blockMenuInfo.Info.shortcut,
  },
  [NoticeGroup.Warning]: {
    extensionName: ExtensionName.Notice,
    attrs: blockMenuInfo.Warning.attrs,
    shortcut: blockMenuInfo.Tip.shortcut,
    icon: (
      <img
        src="/warning-notice.png"
        alt="warning-notice"
        width={102}
        height={24}
      />
    ),
  },
  [NoticeGroup.Tip]: {
    extensionName: ExtensionName.Notice,
    attrs: blockMenuInfo.Tip.attrs,
    shortcut: blockMenuInfo.Tip.shortcut,
    icon: (
      <img src="/tip-notice.png" alt="tip-notice" width={102} height={24} />
    ),
  },
};

const mappingQuizzGroup: { [key in QuizzGroup]?: IMappingBlockGroupItemValue } =
  {
    [QuizzGroup.Single]: {
      extensionName: ExtensionName.Quizz,
      icon: (
        <img
          src="/single-choice.png"
          alt="info-notice"
          width={56}
          height={24}
        />
      ),
      attrs: blockMenuInfo["Single Choice"].attrs,
      shortcut: blockMenuInfo["Single Choice"].shortcut,
    },
    [QuizzGroup.Multiple]: {
      extensionName: ExtensionName.Quizz,
      icon: (
        <img
          src="/multiple-choice.png"
          alt="multiple-choice"
          width={56}
          height={24}
        />
      ),
      attrs: blockMenuInfo["Multiple Choice"].attrs,
      shortcut: blockMenuInfo["Multiple Choice"].shortcut,
    },
    [QuizzGroup.FillInFree]: {
      extensionName: ExtensionName.FillInBlank,
      icon: (
        <img
          src="/fill-in-free-text.png"
          alt="fill-in-free"
          width={47}
          height={27}
        />
      ),
      attrs: blockMenuInfo["Fill in Blank: Free Text"].attrs,
      shortcut: blockMenuInfo["Fill in Blank: Free Text"].shortcut,
    },
    [NoticeGroup.Writing]: {
      extensionName: ExtensionName.Notice,
      attrs: blockMenuInfo.Writing?.attrs,
      shortcut: blockMenuInfo.Writing?.shortcut,
      icon: (
        <img
          src="/writing-block.png"
          alt="writing-block"
          width={68}
          height={18}
        />
      ),
    },
  };

const mappingRecordGroup: {
  [key in RecordGroup]: IMappingBlockGroupItemValue;
} = {
  [RecordGroup.Audio]: {
    extensionName: ExtensionName.Audio,
    icon: <AudioOutlined color="#888E9C" />,
    attrs: blockMenuInfo["Audio Record"].attrs,
    shortcut: blockMenuInfo["Audio Record"].shortcut,
  },
  [RecordGroup.Video]: {
    extensionName: ExtensionName.Video,
    icon: <RecordVideo color="#888E9C" />,
    attrs: blockMenuInfo["Video Record"].attrs,
    shortcut: blockMenuInfo["Video Record"].shortcut,
  },
};

const mappingUploadGroup: {
  [key in UploadGroup]: IMappingBlockGroupItemValue;
} = {
  [UploadGroup.FromComputer]: {
    extensionName: ExtensionName.File,
    icon: <ComputerIcon />,
    attrs: blockMenuInfo["From Computer"].attrs,
    shortcut: blockMenuInfo["From Computer"].shortcut,
  },
};

const mappingEmbedGroup: { [key in EmbedGroup]: IMappingBlockGroupItemValue } =
  {
    [EmbedGroup.EmbedLink]: {
      extensionName: ExtensionName.CommonEmbed,
      icon: <EmbedIcon width={20} />,
      attrs: blockMenuInfo["Embed Link"].attrs,
      shortcut: blockMenuInfo["Embed Link"].shortcut,
    },
    // [EmbedGroup.Youtube]: {
    //   icon: <YoutubeIcon />,
    // },
  };

export const defaultMenu: { [key in ParentBlockMenu]?: GroupBlockItem } = {
  [ParentBlockMenu.Text]: {
    name: ParentBlockMenu.Text,
    icon: <NormalTextIcon width={16} />,
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
    icon: <ListBlockIcon />,
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
    icon: <PageLayoutIcon />,
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
    icon: <MinusOutlined />,
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
    icon: <TableMenuIcon />,
    children: [
      {
        name: "Dynamic Table",
        extensionName: ExtensionName.Table,
        icon: <BorderTableIcon color="transparent" />,
        attrs: { rowsCount: 3, colsCount: 3 },
      },
    ],
  },
  [ParentBlockMenu.Notice]: {
    name: ParentBlockMenu.Notice,
    icon: <InfoCircleOutlined color="#4D5562" />,
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
    icon: <QuizzMenuIcon />,
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
    icon: <RecordCircleIcon />,
    children: Object.keys(mappingRecordGroup).map((m) => {
      const {
        icon,
        attrs,
        shortcut,
        extensionName,
      }: IMappingBlockGroupItemValue = mappingRecordGroup[m];
      return {
        name: m,
        extensionName,
        icon,
        attrs,
        shortcut,
      };
    }),
  },
  [ParentBlockMenu.Upload]: {
    name: ParentBlockMenu.Upload,
    icon: <UploadIcon />,
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
    icon: <EmbedIcon color="#4D5562" />,
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

export const defaultInlineTextMenu: {
  [key in InlineTextGroup]?: IMappingBlockGroupItemValue;
} = {
  [InlineTextGroup.Bold]: {
    extensionName: InlineTextMenuInfo.strong.extensionName,
    icon: <StrongTextIcon />,
    shortcut: InlineTextMenuInfo.strong.shortcut,
    schemaType: "marks",
  },
  [InlineTextGroup.Italic]: {
    extensionName: InlineTextMenuInfo.em.extensionName,
    icon: <ItalicTextIcon />,
    shortcut: InlineTextMenuInfo.em.shortcut,
    schemaType: "marks",
  },
  [InlineTextGroup.Underline]: {
    extensionName: InlineTextMenuInfo.underline.extensionName,
    icon: <UnderlineIcon />,
    shortcut: InlineTextMenuInfo.underline.shortcut,
    schemaType: "marks",
  },
  [InlineTextGroup.Strikethrough]: {
    extensionName: InlineTextMenuInfo.strikethrough.extensionName,
    icon: <StrikethroughIcon />,
    shortcut: InlineTextMenuInfo.strikethrough.shortcut,
    schemaType: "marks",
  },
  [InlineTextGroup.EmbedLink]: {
    extensionName: InlineTextMenuInfo.link.extensionName,
    icon: <EmbedLinkIcon />,
    shortcut: InlineTextMenuInfo.link.shortcut,
    schemaType: "marks",
  },
  [InlineTextGroup.TodoList]: {
    extensionName: ExtensionName.CheckboxList,
    icon: <CheckDoneOutlineIcon />,
    shortcut: blockMenuInfo[ListGroup.Todo].shortcut,
    schemaType: "nodes",
  },
  [InlineTextGroup.OrderedList]: {
    extensionName: ExtensionName.OrderedList,
    icon: <OrderedListIcon />,
    shortcut: blockMenuInfo[ListGroup.Ordered].shortcut,
    schemaType: "nodes",
  },
  [InlineTextGroup.BulletedList]: {
    extensionName: ExtensionName.BulletedList,
    icon: <BulletedIcon />,
    shortcut: blockMenuInfo[ListGroup.Bulleted].shortcut,
    schemaType: "nodes",
  },
};
