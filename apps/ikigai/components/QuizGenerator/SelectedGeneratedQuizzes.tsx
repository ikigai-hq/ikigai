import { AIGenerateQuizInput, ConvertAIQuiz, QuizType } from "graphql/types";
import { Button, ScrollArea } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { useMutation } from "@apollo/client";

import { CONVERT_AI_QUIZ } from "graphql/mutation/QuizMutation";
import { handleError } from "graphql/ApolloClient";
import useEditorStore from "store/EditorStore";
import usePageStore from "store/PageStore";
import usePageContentStore from "store/PageContentStore";
import useQuizStore, {
  AIFillInBlankQuiz,
  AIGeneratedQuiz,
  AIMultipleChoiceQuiz,
  AISingeChoiceQuiz,
} from "store/QuizStore";
import {
  GeneratedQuizReview,
  parseAIFillInBlankQuiz,
} from "./GeneratedQuizItem";
import { Editor, JSONContent } from "@tiptap/react";

export type ReviewGeneratedQuizzesProps = {
  quizzes: AIGeneratedQuiz[];
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
  const [quizCovertAI] = useMutation<ConvertAIQuiz>(CONVERT_AI_QUIZ, {
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

    for (const quiz of quizzes) {
      if (quiz.quizType === QuizType.SINGLE_CHOICE) {
        const quizData = quiz as AISingeChoiceQuiz;
        await insertSingleChoice(editor, pageContentId, {
          question: quizData.question,
          correctAnswer: quizData.correctAnswer,
          answers: quizData.answers,
        });
      }

      if (quiz.quizType === QuizType.MULTIPLE_CHOICE) {
        const quizData = quiz as AIMultipleChoiceQuiz;
        await insertMultipleChoice(editor, pageContentId, {
          question: quizData.question,
          correctAnswers: quizData.correctAnswers,
          answers: quizData.answers,
        });
      }

      if (quiz.quizType === QuizType.FILL_IN_BLANK) {
        const quizData = quiz as AIFillInBlankQuiz;
        await insertFillInBlank(editor, pageContentId, quizData);
      }
    }

    onClose();
    setInsertLoading(false);
  };

  const insertSingleChoice = async (
    editor: Editor,
    pageContentId: string,
    quiz: AISingeChoiceQuiz,
  ) => {
    const dataInput: AIGenerateQuizInput = {
      singleChoiceData: [quiz],
      multipleChoiceData: [],
      fillInBlankData: [],
    };
    const { data } = await quizCovertAI({
      variables: {
        pageContentId,
        data: dataInput,
      },
    });

    if (data) {
      data.quizConvertAiQuiz.forEach((quiz) => {
        addOrUpdateQuiz(quiz);
        editor
          .chain()
          .focus("end")
          .enter()
          .focus("end")
          .insertSingleChoice(quiz.id)
          .run();
      });
    }
  };

  const insertMultipleChoice = async (
    editor: Editor,
    pageContentId: string,
    quiz: AIMultipleChoiceQuiz,
  ) => {
    const dataInput: AIGenerateQuizInput = {
      singleChoiceData: [],
      multipleChoiceData: [quiz],
      fillInBlankData: [],
    };
    const { data } = await quizCovertAI({
      variables: {
        pageContentId,
        data: dataInput,
      },
    });

    if (data) {
      data.quizConvertAiQuiz.forEach((quiz) => {
        addOrUpdateQuiz(quiz);
        editor
          .chain()
          .focus("end")
          .enter()
          .focus("end")
          .insertMultipleChoice(quiz.id)
          .run();
      });
    }
  };

  const insertFillInBlank = async (
    editor: Editor,
    pageContentId: string,
    quiz: AIFillInBlankQuiz,
  ) => {
    const components = parseAIFillInBlankQuiz(quiz);

    const content: JSONContent = {
      type: "paragraph",
      content: [],
    };

    for (const component of components) {
      if (component.componentType === "text") {
        content.content.push({
          type: "text",
          text: component.data.content,
        });
      } else {
        const dataInput: AIGenerateQuizInput = {
          singleChoiceData: [],
          multipleChoiceData: [],
          fillInBlankData: [
            {
              correctAnswer: component.data.content,
            },
          ],
        };
        const { data } = await quizCovertAI({
          variables: {
            pageContentId,
            data: dataInput,
          },
        });

        if (data) {
          data.quizConvertAiQuiz.forEach((quiz) => {
            addOrUpdateQuiz(quiz);
          });
          content.content.push({
            type: "fillInBlank",
            attrs: {
              quizId: data.quizConvertAiQuiz[0].id,
            },
          });
        }
      }
    }

    editor
      .chain()
      .focus("end")
      .enter()
      .focus("end")
      .insertContent(content)
      .run();
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
