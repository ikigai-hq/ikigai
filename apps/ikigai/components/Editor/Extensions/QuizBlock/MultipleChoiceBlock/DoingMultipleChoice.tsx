import { CheckboxGroup, Code, Separator, Text } from "@radix-ui/themes";

import { DocumentActionPermission } from "graphql/types";
import { QuizComponentProps } from "../type";
import usePermission from "hook/UsePermission";
import { useMultipleChoiceQuiz } from "hook/UseQuiz";
import { ChoiceWrapper } from "../ChoiceBlock/ChoiceWrapper";

const DoingMultipleChoice = (props: QuizComponentProps) => {
  const allow = usePermission();
  const { questionData, myAnswer, answerQuiz } = useMultipleChoiceQuiz(
    props.quizId,
    props.parentContentId,
  );

  const onChange = (choices: string[]) => {
    answerQuiz({ choices });
  };

  const choices = myAnswer?.choices || [];
  return (
    <ChoiceWrapper>
      <Text weight="medium">
        <Code>Q.{props.quizIndex + 1}</Code> {questionData.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <CheckboxGroup.Root
        variant="soft"
        onValueChange={onChange}
        value={choices}
        disabled={!allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)}
      >
        {questionData.options.map((option) => (
          <CheckboxGroup.Item key={option.id} value={option.id}>
            {option.content}
          </CheckboxGroup.Item>
        ))}
      </CheckboxGroup.Root>
    </ChoiceWrapper>
  );
};

export default DoingMultipleChoice;
