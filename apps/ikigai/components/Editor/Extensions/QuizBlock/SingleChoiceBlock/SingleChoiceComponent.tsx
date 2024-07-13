import { NodeViewProps } from "@tiptap/core";
import { RadioGroup, Separator, Text } from "@radix-ui/themes";

import { QuizType } from "graphql/types";
import QuizBlockWrapper from "../QuizBlockWrapper";

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
  return (
    <div style={{ padding: 10 }}>
      <Text weight="medium">Question 1: How about Rodgers</Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <RadioGroup.Root value="1" name="example">
        <RadioGroup.Item value="1">A. Awesome</RadioGroup.Item>
        <RadioGroup.Item value="2">B. Handsome</RadioGroup.Item>
        <RadioGroup.Item value="3">C. Cool</RadioGroup.Item>
      </RadioGroup.Root>
    </div>
  );
};

export default SingleChoiceBlockComponent;
