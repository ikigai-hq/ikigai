import { RadioGroup, Separator, Text } from "@radix-ui/themes";

import { DocumentActionPermission } from "graphql/types";
import { SingleChoiceProps } from "./type";
import usePermission from "hook/UsePermission";
import { useSingleChoiceQuiz } from "hook/UseQuiz";

const DoingSingleChoice = (props: SingleChoiceProps) => {
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
    <div style={{ padding: 10 }}>
      <Text weight="medium">Q.1: {questionData.question}</Text>
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
    </div>
  );
};

export default DoingSingleChoice;
