import {
  GenerateQuizzes_documentGenerateQuizzes_quizzes as IGeneratedQuiz,
  QuizType,
  UpsertQuiz,
} from "graphql/types";
import { Button, ScrollArea } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { v4 } from "uuid";
import { useMutation } from "@apollo/client";

import { UPSERT_QUIZ } from "graphql/mutation/QuizMutation";
import { handleError } from "graphql/ApolloClient";
import useEditorStore from "store/EditorStore";
import usePageStore from "store/PageStore";
import usePageContentStore from "store/PageContentStore";
import useQuizStore, {
  ISingleChoiceExpectedAnswer,
  ISingleChoiceQuestion,
} from "store/QuizStore";
import { GeneratedQuizReview, getGeneratedQuizType } from "./GeneratedQuizItem";

export type ReviewGeneratedQuizzesProps = {
  quizzes: IGeneratedQuiz[];
  onClose: () => void;
  onDeselectQuiz: (index: number) => void;
};

export const SelectedGeneratedQuizzes = ({
  quizzes,
  onClose,
  onDeselectQuiz,
}: ReviewGeneratedQuizzesProps) => {
  const activePageId = usePageStore((state) => state.activePageId);
  const activePageContentIds = usePageContentStore((state) =>
    state.pageContents
      .filter((content) => content.pageId === activePageId)
      .map((content) => content.id),
  );
  const activeEditor = useEditorStore((state) => state.activeEditor);
  const pageEditors = useEditorStore((state) =>
    activePageContentIds
      .map((pageContentId) => state.editors[pageContentId])
      .filter((editor) => !!editor),
  );
  const addOrUpdateQuiz = useQuizStore((state) => state.addOrUpdateQuiz);
  const [quizUpsert] = useMutation<UpsertQuiz>(UPSERT_QUIZ, {
    onError: handleError,
  });
  const [insertLoading, setInsertLoading] = useState(false);

  const onInsert = async () => {
    let editor = activeEditor;
    if (!editor) editor = pageEditors[0];
    if (!editor) return;

    setInsertLoading(true);
    const pageContentId =
      editor.options.editorProps.attributes["pageContentId"];
    if (!pageContentId) return;

    const res = await Promise.all(
      quizzes.map(async (selectedQuiz) => {
        // Assume Choice question only
        const quizId = v4();
        const options = selectedQuiz.answers.map((answer) => ({
          id: v4(),
          content: answer,
        }));
        const expectedChoices = (
          selectedQuiz.correctAnswers || [selectedQuiz.correctAnswer]
        )
          .map((correctAnswer) =>
            options.find((option) => option.content === correctAnswer),
          )
          .map((option) => option.id);
        const questionData: ISingleChoiceQuestion = {
          question: selectedQuiz.question,
          options,
        };
        const answerData: ISingleChoiceExpectedAnswer = {
          expectedChoices,
        };

        const { data } = await quizUpsert({
          variables: {
            pageContentId,
            data: {
              id: quizId,
              quizType: getGeneratedQuizType(selectedQuiz),
              questionData,
              answerData,
            },
          },
        });

        if (data) addOrUpdateQuiz(data.quizUpsert);
        return data;
      }),
    );

    res
      .filter((quiz) => !!quiz)
      .forEach((quiz) => {
        const quizType = quiz.quizUpsert.quizType;
        if (quizType === QuizType.SINGLE_CHOICE) {
          editor
            .chain()
            .enter()
            .focus("end")
            .insertSingleChoice(quiz.quizUpsert.id)
            .run();
        } else if (quizType === QuizType.MULTIPLE_CHOICE) {
          editor
            .chain()
            .enter()
            .focus("end")
            .insertMultipleChoice(quiz.quizUpsert.id)
            .run();
        }
      });

    onClose();
    setInsertLoading(false);
  };

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
            onSelect={() => onDeselectQuiz(index)}
            selected
          />
        ))}
      </ScrollArea>
      <div style={{ display: "flex", gap: 5, justifyContent: "right" }}>
        <Button variant="outline" onClick={onClose}>
          <Trans>Close</Trans>
        </Button>
        <Button
          onClick={onInsert}
          loading={insertLoading}
          disabled={insertLoading || quizzes.length === 0}
        >
          <Trans>Insert & Complete</Trans>
        </Button>
      </div>
    </div>
  );
};
