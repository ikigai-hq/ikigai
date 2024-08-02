import { GenerateQuizzes_documentGenerateQuizzes_quizzes as IGeneratedQuiz } from "graphql/types";
import { Button, ScrollArea } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";

import { GeneratedQuizReview } from "./GeneratedQuizItem";

export type ReviewGeneratedQuizzesProps = {
  quizzes: IGeneratedQuiz[];
  onSelect: (index: number) => void;
  backToGenerate: () => void;
  selectAll: () => void;
};

export const ReviewGeneratedQuizzes = ({
  quizzes,
  onSelect,
  backToGenerate,
  selectAll,
}: ReviewGeneratedQuizzesProps) => {
  return (
    <div>
      <ScrollArea
        scrollbars="vertical"
        style={{ height: "70vh", paddingRight: 3 }}
      >
        {quizzes.map((quiz, index) => (
          <GeneratedQuizReview
            index={index}
            quiz={quiz}
            key={index}
            onSelect={() => onSelect(index)}
          />
        ))}
      </ScrollArea>
      <div style={{ display: "flex", gap: 5, justifyContent: "right" }}>
        <Button variant="outline" onClick={backToGenerate}>
          <Trans>Regenerate</Trans>
        </Button>
        <Button onClick={selectAll}>
          <Trans>Select all</Trans>
        </Button>
      </div>
    </div>
  );
};
