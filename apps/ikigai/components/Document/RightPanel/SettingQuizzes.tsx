import React from "react";
import { PanelTitle, QuestionPanelContainer, Section } from "./common";
import { Trans } from "@lingui/macro";
import QuestionListPanel from "./QuestionListSection";

export const SettingQuizzes: React.FC = () => {
  return (
    <QuestionPanelContainer>
      <Section>
        <PanelTitle>
          <Trans>Setting quizzes review</Trans>
        </PanelTitle>
      </Section>
      <QuestionListPanel />
    </QuestionPanelContainer>
  );
};
