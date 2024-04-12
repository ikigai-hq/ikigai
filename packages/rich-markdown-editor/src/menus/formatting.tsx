import {
  OrderedListIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  StrongTextIcon,
  ItalicTextIcon,
  UnderlineIcon,
  StrikethroughIcon,
  QuoteIcon,
  TodoListIcon,
  EmbedLinkIcon,
  AnnotationIcon,
  BulletedListIcon,
  Heading4Icon,
  TextColorIcon,
} from "./icons";
import { QuestionMarkIcon, EditIcon, HighlightIcon } from "outline-icons";
import { isInTable } from "prosemirror-tables";
import { EditorState } from "prosemirror-state";
import isInList from "../queries/isInList";
import isMarkActive from "../queries/isMarkActive";
import isNodeActive from "../queries/isNodeActive";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";
import React from "react";
import {
  ExtensionName,
  InlineTextGroup,
  InlineTextMenuInfo,
  QuizzGroup,
  TextGroup,
  blockMenuInfo,
} from "../types/extensions.enum";

export default function formattingMenuItems(
  state: EditorState,
  isTemplate: boolean,
  dictionary: typeof baseDictionary
): MenuItem[] {
  const { schema } = state;
  const isTable = isInTable(state);
  const isList = isInList(state);
  const allowBlocks = !isTable && !isList;

  return [
    {
      name: ExtensionName.Bold,
      tooltip: InlineTextGroup.Bold,
      icon: <StrongTextIcon />,
      active: isMarkActive(schema.marks.strong),
      shortcut: InlineTextMenuInfo.strong?.shortcut,
    },
    {
      name: ExtensionName.Italic,
      tooltip: InlineTextGroup.Italic,
      icon: <ItalicTextIcon />,
      active: isMarkActive(schema.marks.em),
      shortcut: InlineTextMenuInfo.em?.shortcut,
    },
    {
      name: ExtensionName.Underline,
      tooltip: InlineTextGroup.Underline,
      icon: <UnderlineIcon />,
      active: isMarkActive(schema.marks.underline),
      shortcut: InlineTextMenuInfo.underline?.shortcut,
    },
    {
      name: ExtensionName.Strikethrough,
      tooltip: InlineTextGroup.Strikethrough,
      icon: <StrikethroughIcon />,
      active: isMarkActive(schema.marks.strikethrough),
      shortcut: InlineTextMenuInfo.strikethrough?.shortcut,
    },
    {
      name: ExtensionName.HighlightText,
      tooltip: InlineTextGroup.HighlightText,
      active: isMarkActive(schema.marks.highlight),
      shortcut: "",
      icon: <HighlightIcon color="#888E9C" />,
    },
    {
      name: ExtensionName.TextColor,
      tooltip: InlineTextGroup.TextColor,
      active: isMarkActive(schema.marks.textColor),
      shortcut: "",
      icon: <TextColorIcon />,
    },
    {
      name: "separator",
      visible: allowBlocks,
      shortcut: "",
    },
    {
      name: ExtensionName.Heading,
      tooltip: TextGroup.H1,
      icon: <Heading1Icon />,
      active: isNodeActive(
        schema.nodes.heading,
        blockMenuInfo["Heading 1"]?.attrs
      ),
      attrs: blockMenuInfo["Heading 1"]?.attrs,
      visible: allowBlocks,
      shortcut: blockMenuInfo["Heading 1"]?.shortcut,
    },
    {
      name: ExtensionName.Heading,
      tooltip: TextGroup.H2,
      icon: <Heading2Icon />,
      active: isNodeActive(
        schema.nodes.heading,
        blockMenuInfo["Heading 2"]?.attrs
      ),
      attrs: blockMenuInfo["Heading 2"]?.attrs,
      visible: allowBlocks,
      shortcut: blockMenuInfo["Heading 2"]?.shortcut,
    },
    {
      name: ExtensionName.Heading,
      tooltip: TextGroup.H3,
      icon: <Heading3Icon />,
      active: isNodeActive(
        schema.nodes.heading,
        blockMenuInfo["Heading 3"]?.attrs
      ),
      attrs: blockMenuInfo["Heading 3"]?.attrs,
      visible: allowBlocks,
      shortcut: blockMenuInfo["Heading 3"]?.shortcut,
    },
    {
      name: ExtensionName.Heading,
      tooltip: TextGroup.H4,
      icon: <Heading4Icon />,
      active: isNodeActive(
        schema.nodes.heading,
        blockMenuInfo["Heading 4"]?.attrs
      ),
      attrs: blockMenuInfo["Heading 4"]?.attrs,
      visible: allowBlocks,
      shortcut: blockMenuInfo["Heading 4"]?.shortcut,
    },
    {
      name: ExtensionName.Blockquote,
      tooltip: TextGroup.Quote,
      icon: <QuoteIcon />,
      active: isNodeActive(schema.nodes.blockquote),
      attrs: { level: 2 },
      visible: allowBlocks,
      shortcut: blockMenuInfo.Quote?.shortcut,
    },
    {
      name: "separator",
      visible: allowBlocks || isList,
      shortcut: "",
    },
    {
      name: ExtensionName.BulletedList,
      tooltip: InlineTextGroup.BulletedList,
      icon: <BulletedListIcon />,
      active: isNodeActive(schema.nodes.bullet_list),
      visible: allowBlocks || isList,
      shortcut: blockMenuInfo["Bulleted List"]?.shortcut,
    },
    {
      name: ExtensionName.OrderedList,
      tooltip: InlineTextGroup.OrderedList,
      icon: <OrderedListIcon />,
      active: isNodeActive(schema.nodes.ordered_list),
      visible: allowBlocks || isList,
      shortcut: blockMenuInfo["Ordered List"]?.shortcut,
    },
    {
      name: ExtensionName.CheckboxList,
      tooltip: InlineTextGroup.TodoList,
      icon: <TodoListIcon />,
      keywords: "checklist checkbox task",
      active: isNodeActive(schema.nodes.checkbox_list),
      visible: allowBlocks || isList,
      shortcut: blockMenuInfo["Todo List"]?.shortcut,
    },
    {
      name: "separator",
      shortcut: "",
    },
    {
      name: ExtensionName.Link,
      tooltip: dictionary.createLink,
      icon: <EmbedLinkIcon />,
      active: isMarkActive(schema.marks.link),
      attrs: { href: "" },
      shortcut: InlineTextMenuInfo.link?.shortcut,
    },
    {
      name: ExtensionName.Annotation,
      tooltip: dictionary.annotation,
      icon: <AnnotationIcon />,
    },
    {
      name: ExtensionName.Annotation,
      tooltip: InlineTextGroup.ReplaceText,
      icon: <EditIcon color="#888E9C" />,
      attrs: { type: "replace" },
    },
    {
      name: ExtensionName.FillInBlank,
      tooltip: QuizzGroup.FillInSelect,
      icon: <QuestionMarkIcon color="#888E9C" />,
      shortcut: InlineTextMenuInfo.fill_in_blank?.shortcut,
    },
  ];
}
