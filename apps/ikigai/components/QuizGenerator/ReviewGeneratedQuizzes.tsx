import {
  GenerateQuizzes_documentGenerateQuizzes_quizzes as IGeneratedQuiz,
  QuizType,
  UpsertQuiz,
} from "graphql/types";
import {
  Button,
  CheckboxGroup,
  Kbd,
  RadioGroup,
  ScrollArea,
  Separator,
  Text,
} from "@radix-ui/themes";
import { Trans } from "@lingui/macro";
import styled from "styled-components";
import { useEffect, useState } from "react";
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

export type ReviewGeneratedQuizzesProps = {
  data: IGeneratedQuiz[];
  onClose: () => void;
  quizType: QuizType;
};

export const ReviewGeneratedQuizzes = ({
  data,
  onClose,
  quizType,
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
  const [selectedQuizzes, setSelectedQuizzes] = useState<Map<number, boolean>>(
    new Map(),
  );

  useEffect(() => {
    const newSelectedQuizzes = new Map();
    data.forEach((_quiz, index) => {
      newSelectedQuizzes.set(index, true);
    });
    setSelectedQuizzes(newSelectedQuizzes);
  }, [data]);

  const onSelect = (index: number) => {
    const selected = selectedQuizzes.get(index);
    selectedQuizzes.set(index, !selected);
    setSelectedQuizzes(new Map(selectedQuizzes));
  };

  const onInsert = async () => {
    let editor = activeEditor;
    if (!editor) editor = pageEditors[0];
    if (!editor) return;

    setInsertLoading(true);
    const pageContentId =
      editor.options.editorProps.attributes["pageContentId"];
    if (!pageContentId) return;

    const quizzes = await Promise.all(
      Array.from(selectedQuizzes.keys()).map(async (index) => {
        const selectedQuiz = data[index];
        if (selectedQuiz) {
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
                quizType,
                questionData,
                answerData,
              },
            },
          });

          if (data) addOrUpdateQuiz(data.quizUpsert);
          return data;
        }
      }),
    );

    quizzes
      .filter((quiz) => !!quiz)
      .forEach((quiz) => {
        console.log("hello", quizType);
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
    setInsertLoading(false);
  };

  return (
    <div>
      <ScrollArea
        scrollbars="vertical"
        style={{ height: "70vh", paddingRight: 3 }}
      >
        {data.map((quiz, index) =>
          quiz.correctAnswer ? (
            <GeneratedSingleChoiceReview
              index={index}
              quiz={quiz}
              key={index}
              selected={selectedQuizzes.get(index)}
              onSelect={() => onSelect(index)}
            />
          ) : (
            <GeneratedMultipleChoiceReview
              index={index}
              quiz={quiz}
              key={index}
              selected={selectedQuizzes.get(index)}
              onSelect={() => onSelect(index)}
            />
          ),
        )}
      </ScrollArea>
      <div style={{ display: "flex", gap: 5, justifyContent: "right" }}>
        <Button variant={"soft"} color={"gray"} onClick={onClose}>
          <Trans>Close</Trans>
        </Button>
        <Button
          onClick={onInsert}
          loading={insertLoading}
          disabled={insertLoading}
        >
          <Trans>Insert</Trans>
        </Button>
      </div>
    </div>
  );
};

export type GeneratedChoiceReviewProps = {
  index: number;
  quiz: IGeneratedQuiz;
  selected?: boolean;
  onSelect?: () => void;
};

const GeneratedSingleChoiceReview = ({
  index,
  quiz,
  selected,
  onSelect,
}: GeneratedChoiceReviewProps) => {
  return (
    <QuizWrapper onClick={onSelect} $selected={selected}>
      <Text weight="medium">
        <Kbd>Q.{index + 1}</Kbd> {quiz.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <RadioGroup.Root variant="soft" value={quiz.correctAnswer}>
        {quiz.answers.map((option) => (
          <RadioGroup.Item key={option} value={option}>
            {option}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </QuizWrapper>
  );
};

const GeneratedMultipleChoiceReview = ({
  index,
  quiz,
  selected,
  onSelect,
}: GeneratedChoiceReviewProps) => {
  return (
    <QuizWrapper $selected={selected} onSelect={onSelect}>
      <Text weight="medium">
        <Kbd>Q.{index + 1}</Kbd> {quiz.question}
      </Text>
      <Separator style={{ width: "100%", marginTop: 5, marginBottom: 5 }} />
      <CheckboxGroup.Root variant="soft" value={quiz.correctAnswers}>
        {quiz.answers.map((option) => (
          <CheckboxGroup.Item key={option} value={option}>
            {option}
          </CheckboxGroup.Item>
        ))}
      </CheckboxGroup.Root>
    </QuizWrapper>
  );
};

const QuizWrapper = styled.div<{ $selected?: boolean }>`
  border: ${(props) =>
    props.$selected ? "1px solid var(--indigo-9)" : "1px solid var(--gray-5)"};
  padding: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: pointer;
`;
