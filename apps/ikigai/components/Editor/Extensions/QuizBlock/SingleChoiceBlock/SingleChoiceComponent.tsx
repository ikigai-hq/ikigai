import { NodeViewProps } from "@tiptap/core";
import { RadioGroup, Separator, Text } from "@radix-ui/themes";

import { QuizType } from "graphql/types";
import QuizBlockWrapper from "../QuizBlockWrapper";
import { useSingleChoiceQuiz } from "hook/UseQuiz";

const SingleChoiceBlockComponent = (props: NodeViewProps) => {
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;

  return (
    <QuizBlockWrapper quizType={QuizType.SINGLE_CHOICE} nodeViewProps={props}>
      <SingleChoice parentContentId={pageContentId} quizId={quizId} />
    </QuizBlockWrapper>
  );
};

export type SingleChoiceProps = {
  parentContentId: string;
  quizId: string;
};

export const SingleChoice = (props: SingleChoiceProps) => {
  const { questionData } = useSingleChoiceQuiz(
    props.quizId,
    props.parentContentId,
  );

  return (
    <div style={{ padding: 10 }}>
      <Text weight="medium">Question 1: {questionData.question}</Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <RadioGroup.Root value="1" name="example">
        {questionData.options.map((option) => (
          <RadioGroup.Item key={option.id} value={option.id}>
            {option.content}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
};

export default SingleChoiceBlockComponent;
