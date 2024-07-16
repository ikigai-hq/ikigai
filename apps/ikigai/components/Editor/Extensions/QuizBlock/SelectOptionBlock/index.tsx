import { createInlineQuiz } from "../QuizNode";
import SelectOptionComponent from "./SelectOptionComponent";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    selectOption: {
      insertSelectOption: () => ReturnType;
    };
  }
}

export const SELECT_OPTION_BLOCK_NAME = "selectOption";
export const SELECT_OPTION_TAG_NAME = "select-option";

export default createInlineQuiz(
  SELECT_OPTION_BLOCK_NAME,
  SELECT_OPTION_TAG_NAME,
  SelectOptionComponent,
  {
    addCommands() {
      return {
        insertSelectOption:
          () =>
          ({ commands }) => {
            return commands.insertContent([
              {
                type: SELECT_OPTION_BLOCK_NAME,
              },
            ]);
          },
      };
    },
  },
);
