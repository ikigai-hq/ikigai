import createQuizNode from "../QuizNode";
import SingleChoiceBlockComponent from "./SingleChoiceComponent";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    singleChoiceBlock: {
      insertSingleChoice: () => ReturnType;
    };
  }
}

export const SINGLE_CHOICE_BLOCK_NAME = "singleChoice";
export const SINGLE_CHOICE_BLOCK_TAG = "single-choice";

export default createQuizNode(
  SINGLE_CHOICE_BLOCK_NAME,
  SINGLE_CHOICE_BLOCK_TAG,
  SingleChoiceBlockComponent,
  {
    addCommands() {
      return {
        insertSingleChoice:
          () =>
          ({ commands }) => {
            return commands.insertContent([
              {
                type: SINGLE_CHOICE_BLOCK_NAME,
              },
            ]);
          },
      };
    },
  },
);
