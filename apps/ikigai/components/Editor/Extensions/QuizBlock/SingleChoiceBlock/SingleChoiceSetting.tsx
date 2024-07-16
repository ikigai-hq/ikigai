import React from "react";
import { t } from "@lingui/macro";

import { QuizComponentProps } from "../type";
import ChoiceSetting from "../ChoiceBlock/ChoiceSeting";
import { useSingleChoiceQuiz } from "hook/UseQuiz";

export type SingleChoiceSettingProps = QuizComponentProps & {
  showSetting: boolean;
  setShowSetting: (setting: boolean) => void;
};

const SingleChoiceSetting = (props: SingleChoiceSettingProps) => {
  const { questionData, answerData, upsertQuiz } = useSingleChoiceQuiz(
    props.quizId,
    props.pageContentId,
  );

  return (
    <ChoiceSetting
      questionData={questionData}
      answerData={answerData}
      upsertQuiz={upsertQuiz}
      title={t`Single Choice Setting`}
      description={t`Declare your question, options, and then choose the correct answer.`}
      {...props}
    />
  );
};

export default SingleChoiceSetting;
