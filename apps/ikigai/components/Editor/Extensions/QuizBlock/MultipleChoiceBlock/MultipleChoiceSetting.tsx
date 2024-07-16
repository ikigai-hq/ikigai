import React from "react";
import { t } from "@lingui/macro";

import { QuizComponentProps } from "../type";
import ChoiceSetting from "../ChoiceBlock/ChoiceSeting";
import { useMultipleChoiceQuiz } from "hook/UseQuiz";

export type MultipleChoiceSettingProps = QuizComponentProps & {
  showSetting: boolean;
  setShowSetting: (setting: boolean) => void;
};

const MultipleChoiceSetting = (props: MultipleChoiceSettingProps) => {
  const { questionData, answerData, upsertQuiz } = useMultipleChoiceQuiz(
    props.quizId,
    props.pageContentId,
  );

  return (
    <ChoiceSetting
      questionData={questionData}
      answerData={answerData}
      upsertQuiz={upsertQuiz}
      title={t`Multiple Choice Setting`}
      description={t`Declare your question, options, and then choose the correct answer.`}
      {...props}
    />
  );
};

export default MultipleChoiceSetting;
