import { useMutation } from "@apollo/client";
import { v4 } from "uuid";
import { cloneDeep, isEqual } from "lodash";
import { useDebounceFn } from "ahooks";

import useQuizStore, {
  identityExpectedAnswer,
  identityQuestionData,
  IQuiz,
  ISingleChoiceExpectedAnswer,
  ISingleChoiceQuestion,
  IWritingQuestion,
  QuestionData,
  QuestionExpectedAnswer,
} from "store/QuizStore";
import {
  ANSWER_QUIZ,
  CLONE_QUIZ,
  UPSERT_QUIZ,
} from "graphql/mutation/QuizMutation";
import { handleError } from "graphql/ApolloClient";
import { AnswerQuiz, CloneQuiz, QuizType, UpsertQuiz } from "graphql/types";
import { isEmptyUuid } from "util/FileUtil";

const useQuiz = <
  Question extends QuestionData,
  ExpectedAnswer extends QuestionExpectedAnswer,
>(
  quizType: QuizType,
  quizId: string,
  pageContentId: string,
) => {
  const quiz = useQuizStore((state) =>
    state.quizzes.find((q) => q.id === quizId),
  );
  const addOrUpdateQuiz = useQuizStore((state) => state.addOrUpdateQuiz);
  const [quizUpsert, { loading: upsertLoading }] = useMutation<UpsertQuiz>(
    UPSERT_QUIZ,
    {
      onError: handleError,
    },
  );
  const [quizClone, { loading: cloneLoading }] = useMutation<CloneQuiz>(
    CLONE_QUIZ,
    {
      onError: handleError,
    },
  );
  const [quizAnswer, { loading: answerLoading }] = useMutation<AnswerQuiz>(
    ANSWER_QUIZ,
    {
      onError: handleError,
    },
  );

  const upsertQuiz = async (
    questionData: Question,
    answerData: ExpectedAnswer,
  ): Promise<IQuiz | undefined> => {
    const newQuizId = isEmptyUuid(quizId) ? v4() : quizId;
    const { data } = await quizUpsert({
      variables: {
        pageContentId,
        data: {
          id: newQuizId,
          quizType,
          questionData,
          answerData,
        },
      },
    });

    if (data) {
      addOrUpdateQuiz(data.quizUpsert);
      return data.quizUpsert;
    }
  };

  const cloneQuiz = async (
    originalQuizId: string,
  ): Promise<IQuiz | undefined> => {
    const newQuizId = isEmptyUuid(quizId) ? v4() : quizId;
    const { data } = await quizClone({
      variables: {
        quizId: originalQuizId,
        newQuizId,
        newPageContentId: pageContentId,
      },
    });

    if (data) {
      addOrUpdateQuiz(data.quizClone);
      return data.quizClone;
    }
  };

  const answerQuiz = async (answerData: any) => {
    const { data } = await quizAnswer({
      variables: {
        data: {
          quizId,
          answerData,
        },
      },
    });

    if (data) {
      quiz.myAnswer = cloneDeep(data.quizAnswer);
      addOrUpdateQuiz(quiz);
    }
  };

  const { run: debounceUpsertQuiz, cancel: cancelDebounceUpsertQuiz } =
    useDebounceFn(upsertQuiz, { wait: 200, maxWait: 2000 });
  const { run: debounceAnswerQuiz, cancel: cancelDebounceAnswerQuiz } =
    useDebounceFn(answerQuiz, { wait: 200, maxWait: 2000 });

  return {
    questionData: identityQuestionData<Question>(
      isEmptyQuizData(quiz.questionData)
        ? getDefaultQuestionData(quizType)
        : quiz.questionData,
    ),
    answerData: identityExpectedAnswer<ExpectedAnswer>(
      isEmptyQuizData(quiz.answerData)
        ? getDefaultExpectedAnswer(quizType)
        : quiz.answerData,
    ),
    quiz,
    upsertLoading,
    cloneLoading,
    answerLoading,
    upsertQuiz,
    cloneQuiz,
    answerQuiz,
    debounceUpsertQuiz,
    cancelDebounceUpsertQuiz,
    debounceAnswerQuiz,
    cancelDebounceAnswerQuiz,
  };
};

export const useWritingQuiz = (quizId: string, pageContentId: string) => {
  return useQuiz<IWritingQuestion, {}>(
    QuizType.WRITING_BLOCK,
    quizId,
    pageContentId,
  );
};

export const useSingleChoiceQuiz = (quizId: string, pageContentId: string) => {
  return useQuiz<ISingleChoiceQuestion, ISingleChoiceExpectedAnswer>(
    QuizType.SINGLE_CHOICE,
    quizId,
    pageContentId,
  );
};

const isEmptyQuizData = (data: any): boolean => {
  return data === undefined || data === null || isEqual(data, {});
};

export const getDefaultQuestionData = (quizType: QuizType): QuestionData => {
  switch (quizType) {
    case QuizType.WRITING_BLOCK:
      return { content: {} };
    case QuizType.SINGLE_CHOICE:
      return {
        question: "",
        options: [],
      };
    case QuizType.MULTIPLE_CHOICE:
      return {
        question: "",
        options: [],
      };
    default:
      return {};
  }
};

export const getDefaultExpectedAnswer = (
  quizType: QuizType,
): QuestionExpectedAnswer => {
  switch (quizType) {
    case QuizType.SINGLE_CHOICE:
    case QuizType.MULTIPLE_CHOICE:
      return {
        expectedChoices: [],
      };
    default:
      return {};
  }
};

export default useQuiz;
