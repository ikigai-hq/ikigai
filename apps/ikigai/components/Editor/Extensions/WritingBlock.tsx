import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    writingBlock: {
      setWritingBlock: () => ReturnType;
      toggleWritingBlock: () => ReturnType;
      unsetWritingBlock: () => ReturnType;
    };
  }
}

export const WritingBlock = Node.create({
  name: "writingBlock",

  content: "block+",

  group: "block",

  defining: true,

  parseHTML() {
    return [{ tag: "writing-block" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "writing-block",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        "div",
        {
          class: "rodgers",
        },
        0,
      ],
    ];
  },

  addCommands() {
    return {
      setWritingBlock:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleWritingBlock:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetWritingBlock:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
