import { Editor } from "@tiptap/react";
import { MenuOption } from "../types";

enum SlashMenuGroup {
  BasicBlocks = "BasicBlocks",
}

export const mappingGroupTitle: { [key in SlashMenuGroup]: string } = {
  [SlashMenuGroup.BasicBlocks]: "Basic Blocks",
};

export const getSlashMenuOptions = (
  editor: Editor,
): {
  [key in SlashMenuGroup]: MenuOption[];
} => {
  return {
    [SlashMenuGroup.BasicBlocks]: [
      {
        urlImage: "/slash-menu-options/quote.png",
        title: "Quote",
        descriptions: "Capture a quote.",
        command: editor?.chain()?.focus()?.toggleBlockquote(),
      },
      {
        urlImage: "/slash-menu-options/bulleted-list.png",
        title: "Bulleted list",
        descriptions: "Create a simple bulleted list.",
        command: editor?.chain()?.focus()?.toggleBlockquote(),
      },
      {
        urlImage: "/slash-menu-options/numbered-list.png",
        title: "Numbered list",
        descriptions: "Create a list with numbering.",
        command: editor?.chain()?.focus()?.toggleOrderedList(),
      },
      {
        urlImage: "/slash-menu-options/heading.png",
        title: "Heading 1",
        descriptions: "Big section heading.",
        command: editor?.chain()?.focus()?.toggleHeading({ level: 1 }),
      },
      {
        urlImage: "/slash-menu-options/heading-2.png",
        title: "Heading 2",
        descriptions: "Medium section heading.",
        command: editor?.chain()?.focus()?.toggleHeading({ level: 2 }),
      },
      {
        urlImage: "/slash-menu-options/heading-3.png",
        title: "Heading 3",
        descriptions: "Small section heading.",
        command: editor?.chain()?.focus()?.toggleHeading({ level: 3 }),
      },
    ],
  };
};
