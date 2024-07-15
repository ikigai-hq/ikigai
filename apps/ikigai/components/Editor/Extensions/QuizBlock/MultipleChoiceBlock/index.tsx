import createQuizNode from "../QuizNode";
import MultipleChoiceBlockComponent from "./MultipleChoiceComponent";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    multipleChoice: {
      insertMultipleChoice: () => ReturnType;
    };
  }
}

export const MULTIPLE_CHOICE_BLOCK_NAME = "multipleChoice";
export const MULTIPLE_CHOICE_TAG_NAME = "multiple-choice";

export default createQuizNode(
  MULTIPLE_CHOICE_BLOCK_NAME,
  MULTIPLE_CHOICE_TAG_NAME,
  MultipleChoiceBlockComponent,
  {
    addCommands() {
      return {
        insertMultipleChoice:
          () =>
          ({ commands }) => {
            return commands.insertContent([
              {
                type: MULTIPLE_CHOICE_BLOCK_NAME,
              },
            ]);
          },
      };
    },
  },
);
