import { mergeAttributes, Node } from "@tiptap/core";

import { ReactNodeViewRenderer } from "@tiptap/react";
import WritingBlockComponent from "./WritingBlockComponent";
import { EMPTY_UUID } from "util/FileUtil";

export type WritingBlockOptions = {
  pageContentId: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    writingBlock: {
      insertWritingBlock: () => ReturnType;
    };
  }
}

export default Node.create<WritingBlockOptions>({
  name: "writingBlock",
  group: "block",
  atom: true,
  selectable: true,

  addOptions() {
    return {
      pageContentId: EMPTY_UUID,
    };
  },

  addAttributes() {
    return {
      writingBlockId: {
        default: EMPTY_UUID,
      },
      originalBlockId: {
        default: EMPTY_UUID,
      },
    };
  },

  addCommands() {
    return {
      insertWritingBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent([
            {
              type: this.name,
            },
          ]);
        },
    };
  },

  parseHTML() {
    return [{ tag: "writing-block" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["writing-block", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WritingBlockComponent);
  },
});
