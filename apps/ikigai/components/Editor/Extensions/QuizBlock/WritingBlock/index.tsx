import WritingBlockComponent from "./WritingBlockComponent";
import createQuizNode from "../QuizNode";

export const WRITING_BLOCK_NAME = "writingBlock";
export const WRITING_BLOCK_TAG = "writing-block";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    writingBlock: {
      insertWritingBlock: () => ReturnType;
    };
  }
}

export default createQuizNode(
  WRITING_BLOCK_NAME,
  WRITING_BLOCK_TAG,
  WritingBlockComponent,
  {
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
  },
);
