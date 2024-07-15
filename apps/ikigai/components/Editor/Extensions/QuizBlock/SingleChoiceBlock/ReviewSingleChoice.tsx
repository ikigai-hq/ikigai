import { RadioGroup, Separator, Strong, Text } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";

import { useSingleChoiceQuiz } from "hook/UseQuiz";
import { SingleChoiceProps } from "./type";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";

export type ReviewSingleChoiceProps = SingleChoiceProps & {
  userId: number;
};

const ReviewSingleChoice = (props: ReviewSingleChoiceProps) => {
  const allow = usePermission();
  const { questionData, quiz, answerData } = useSingleChoiceQuiz(
    props.quizId,
    props.parentContentId,
  );

  const answer = quiz?.answers?.find(
    (answer) => answer.userId === props.userId,
  );
  const choice = answer?.singleChoiceAnswer
    ? answer.singleChoiceAnswer.choices[0]
    : null;

  const isCorrect = !!answer?.score;
  const color = !allow(DocumentActionPermission.VIEW_ANSWER)
    ? "indigo"
    : isCorrect
    ? "green"
    : "red";
  const correctAnswers = questionData.options.filter((option) =>
    answerData?.expectedChoices?.includes(option.id),
  );
  const explainAnswer = correctAnswers
    .map((answer) => answer.content)
    .join(", ");
  return (
    <div style={{ padding: 10 }}>
      <Text weight="medium">
        Q.{props.quizIndex + 1}: {questionData.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <RadioGroup.Root variant="soft" value={choice} color={color}>
        {questionData.options.map((option) => (
          <RadioGroup.Item key={option.id} value={option.id}>
            {option.content}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
      {allow(DocumentActionPermission.VIEW_ANSWER) && isCorrect && (
        <Text color="green" size="2">
          <Trans>The answer is correct!</Trans>
        </Text>
      )}
      {allow(DocumentActionPermission.VIEW_ANSWER) && !isCorrect && (
        <Text color="red" size="2">
          <Trans>
            The answer is incorrect! Correct answer is{" "}
            <Strong>{explainAnswer}</Strong>
          </Trans>
        </Text>
      )}
    </div>
  );
};

export default ReviewSingleChoice;
