import { Kbd, RadioGroup, Separator, Strong, Text } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";

import { useSingleChoiceQuiz } from "hook/UseQuiz";
import { QuizComponentProps } from "../type";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import { ChoiceWrapper } from "../ChoiceBlock/ChoiceWrapper";

export type ReviewSingleChoiceProps = QuizComponentProps & {
  userId: number;
};

const ReviewSingleChoice = (props: ReviewSingleChoiceProps) => {
  const allow = usePermission();
  const { questionData, quiz, answerData } = useSingleChoiceQuiz(
    props.quizId,
    props.pageContentId,
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
    <ChoiceWrapper>
      <Text weight="medium">
        <Kbd>Q.{props.quizIndex + 1}</Kbd> {questionData.question}
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
          <Trans>correct!</Trans>
        </Text>
      )}
      {allow(DocumentActionPermission.VIEW_ANSWER) && !isCorrect && (
        <Text color="red" size="2">
          <Trans>
            Incorrect! Correct answer is <Strong>{explainAnswer}</Strong>
          </Trans>
        </Text>
      )}
    </ChoiceWrapper>
  );
};

export default ReviewSingleChoice;
