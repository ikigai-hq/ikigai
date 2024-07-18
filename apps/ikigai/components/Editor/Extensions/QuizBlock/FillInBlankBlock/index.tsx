import { createInlineQuiz } from "../QuizNode";

import FillInBlankComponent from "./FillInBlankComponent";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fillInBlank: {
      insertFillInBlank: () => ReturnType;
    };
  }
}

export const FILL_IN_BLANK_BLOCK_NAME = "fillInBlank";
export const FILL_IN_BLANK_TAG_NAME = "fill-in-blank";

export default createInlineQuiz(
  FILL_IN_BLANK_BLOCK_NAME,
  FILL_IN_BLANK_TAG_NAME,
  FillInBlankComponent,
  {
    addCommands() {
      return {
        insertFillInBlank:
          () =>
          ({ commands }) => {
            return commands.insertContent([
              {
                type: FILL_IN_BLANK_BLOCK_NAME,
              },
            ]);
          },
      };
    },
  },
);
