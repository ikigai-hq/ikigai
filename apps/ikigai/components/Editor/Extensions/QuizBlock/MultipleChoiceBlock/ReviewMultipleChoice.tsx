import { CheckboxGroup, Separator, Strong, Text } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";

import { useMultipleChoiceQuiz } from "hook/UseQuiz";
import { QuizComponentProps } from "../type";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import { ChoiceWrapper } from "../ChoiceBlock/ChoiceWrapper";

export type ReviewMultipleChoiceProps = QuizComponentProps & {
  userId: number;
};

const ReviewMultipleChoice = (props: ReviewMultipleChoiceProps) => {
  const allow = usePermission();
  const { questionData, quiz, answerData } = useMultipleChoiceQuiz(
    props.quizId,
    props.parentContentId,
  );

  const answer = quiz?.answers?.find(
    (answer) => answer.userId === props.userId,
  );
  const choices = answer?.multipleChoiceAnswer
    ? answer.multipleChoiceAnswer.choices
    : [];

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
        Q.{props.quizIndex + 1}: {questionData.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <CheckboxGroup.Root variant="soft" value={choices} color={color}>
        {questionData.options.map((option) => (
          <CheckboxGroup.Item key={option.id} value={option.id}>
            {option.content}
          </CheckboxGroup.Item>
        ))}
      </CheckboxGroup.Root>
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
    </ChoiceWrapper>
  );
};

export default ReviewMultipleChoice;
