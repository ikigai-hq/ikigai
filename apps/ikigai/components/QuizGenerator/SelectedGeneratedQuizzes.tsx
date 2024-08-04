import {
  GenerateQuizzes_quizGenerateByAi_quizzes as IGeneratedQuiz,
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
import useQuizStore from "store/QuizStore";
import { GeneratedQuizReview } from "./GeneratedQuizItem";

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
        const quizId = v4();
        const { data } = await quizUpsert({
          variables: {
            pageContentId,
            data: {
              id: quizId,
              quizType: selectedQuiz.quizType,
              questionData: selectedQuiz.completionFullData.questionData,
              answerData: selectedQuiz.completionFullData.answerData,
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
        let command = editor.chain().enter().focus("end");

        if (quizType === QuizType.SINGLE_CHOICE) {
          command = command.insertSingleChoice(quiz.quizUpsert.id);
        } else if (quizType === QuizType.MULTIPLE_CHOICE) {
          command = command.insertMultipleChoice(quiz.quizUpsert.id);
        }

        command.run();
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
