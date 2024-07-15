import { Code, RadioGroup, Separator, Text } from "@radix-ui/themes";

import { DocumentActionPermission } from "graphql/types";
import { QuizComponentProps } from "../type";
import usePermission from "hook/UsePermission";
import { useSingleChoiceQuiz } from "hook/UseQuiz";
import { ChoiceWrapper } from "../ChoiceBlock/ChoiceWrapper";

const DoingSingleChoice = (props: QuizComponentProps) => {
  const allow = usePermission();
  const { questionData, myAnswer, answerQuiz } = useSingleChoiceQuiz(
    props.quizId,
    props.parentContentId,
  );

  const onChange = (choice: string) => {
    answerQuiz({ choices: [choice] });
  };

  const choice = myAnswer?.choices ? myAnswer.choices[0] : undefined;
  return (
    <ChoiceWrapper>
      <Text weight="medium">
        <Code>Q.{props.quizIndex + 1}</Code> {questionData.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <RadioGroup.Root
        variant="soft"
        onValueChange={onChange}
        value={choice}
        disabled={!allow(DocumentActionPermission.INTERACTIVE_WITH_TOOL)}
      >
        {questionData.options.map((option) => (
          <RadioGroup.Item key={option.id} value={option.id}>
            {option.content}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </ChoiceWrapper>
  );
};

export default DoingSingleChoice;
