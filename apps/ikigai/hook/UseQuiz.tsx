import { useMutation } from "@apollo/client";
import { v4 } from "uuid";
import { cloneDeep, isEqual } from "lodash";
import { useDebounceFn } from "ahooks";
import { JSONContent } from "@tiptap/react";

import useQuizStore, {
  identityExpectedAnswer,
  identityQuestionData,
  identityUserAnswer,
  IMultipleChoiceAnswer,
  IMultipleChoiceExpectedAnswer,
  IMultipleChoiceQuestion,
  IQuiz,
  ISelectOptionAnswer,
  ISelectOptionExpectedAnswer,
  ISelectOptionQuestion,
  ISingleChoiceAnswer,
  ISingleChoiceExpectedAnswer,
  ISingleChoiceQuestion,
  IWritingQuestion,
  QuestionData,
  QuestionExpectedAnswer,
  QuestionUserAnswer,
} from "store/QuizStore";
import {
  ANSWER_QUIZ,
  CLONE_QUIZ,
  UPSERT_QUIZ,
} from "graphql/mutation/QuizMutation";
import { handleError } from "graphql/ApolloClient";
import { AnswerQuiz, CloneQuiz, QuizType, UpsertQuiz } from "graphql/types";
import { isEmptyUuid } from "util/FileUtil";
import usePageContentStore from "store/PageContentStore";
import usePageStore from "store/PageStore";
import useDocumentStore from "store/DocumentStore";

const useQuiz = <
  Question extends QuestionData,
  ExpectedAnswer extends QuestionExpectedAnswer,
  UserAnswer extends QuestionUserAnswer,
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

  const answerQuiz = async (answerData: UserAnswer) => {
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
    useDebounceFn(upsertQuiz, { wait: 100, maxWait: 1000 });
  const { run: debounceAnswerQuiz, cancel: cancelDebounceAnswerQuiz } =
    useDebounceFn(answerQuiz, { wait: 100, maxWait: 1000 });

  return {
    questionData: identityQuestionData<Question>(
      isEmptyQuizData(quiz?.questionData)
        ? getDefaultQuestionData(quizType)
        : quiz.questionData,
    ),
    answerData: identityExpectedAnswer<ExpectedAnswer>(
      isEmptyQuizData(quiz?.answerData)
        ? getDefaultExpectedAnswer(quizType)
        : quiz.answerData,
    ),
    myAnswer: identityUserAnswer<UserAnswer>(
      isEmptyQuizData(quiz?.myAnswer?.answerData)
        ? getDefaultUserAnswer(quizType)
        : quiz.myAnswer.answerData,
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
  return useQuiz<IWritingQuestion, {}, {}>(
    QuizType.WRITING_BLOCK,
    quizId,
    pageContentId,
  );
};

export const useSingleChoiceQuiz = (quizId: string, pageContentId: string) => {
  return useQuiz<
    ISingleChoiceQuestion,
    ISingleChoiceExpectedAnswer,
    ISingleChoiceAnswer
  >(QuizType.SINGLE_CHOICE, quizId, pageContentId);
};

export const useMultipleChoiceQuiz = (
  quizId: string,
  pageContentId: string,
) => {
  return useQuiz<
    IMultipleChoiceQuestion,
    IMultipleChoiceExpectedAnswer,
    IMultipleChoiceAnswer
  >(QuizType.MULTIPLE_CHOICE, quizId, pageContentId);
};

export const useSelectOptionQuiz = (quizId: string, pageContentId: string) => {
  return useQuiz<
    ISelectOptionQuestion,
    ISelectOptionExpectedAnswer,
    ISelectOptionAnswer
  >(QuizType.SELECT_OPTION, quizId, pageContentId);
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
    case QuizType.SELECT_OPTION:
      return {
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
    case QuizType.SELECT_OPTION:
      return {
        expectedChoices: [],
      };
    default:
      return {};
  }
};

export const getDefaultUserAnswer = (
  quizType: QuizType,
): QuestionUserAnswer => {
  switch (quizType) {
    case QuizType.SINGLE_CHOICE:
    case QuizType.MULTIPLE_CHOICE:
      return {
        choices: [],
      };
    case QuizType.SELECT_OPTION:
      return {
        choice: "",
      };
    default:
      return {};
  }
};

export const useOrderedQuizzes = () => {
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const orderedPages = usePageStore((state) =>
    state.pages
      .filter((page) => page.documentId === activeDocumentId)
      .sort((a, b) => a.index - b.index),
  );
  const orderedPageIds = orderedPages.map((page) => page.id);

  const orderedPageContents = usePageContentStore((state) =>
    state.pageContents
      .filter((pageContent) => orderedPageIds.includes(pageContent.pageId))
      .sort((pageContent, otherPageContent) => {
        // Sort by Page Index first
        const page = orderedPages.find(
          (page) => page.id === pageContent.pageId,
        );
        const otherPage = orderedPages.find(
          (page) => page.id === otherPageContent.pageId,
        );
        const pageDelta = page.index - otherPage.index;
        if (pageDelta !== 0) return pageDelta;

        // Same Page, Sort by Page Content Index
        return pageContent.index - otherPageContent.index;
      }),
  );
  const pageContentIds = orderedPageContents.map(
    (pageContent) => pageContent.id,
  );

  const quizzes = useQuizStore((state) =>
    state.quizzes.filter((quiz) => {
      const page = orderedPageContents.find(
        (pageContent) => quiz.pageContentId === pageContent.id,
      );
      return hasQuizInContent(page.body, quiz.id);
    }),
  );
  const orderedQuizzes = quizzes.sort((quiz, otherQuiz) => {
    // Sort by Page Content
    const pageContentIndex = pageContentIds.findIndex(
      (id) => quiz.pageContentId === id,
    );
    const otherPageContentIndex = pageContentIds.findIndex(
      (id) => otherQuiz.pageContentId === id,
    );
    const pageContentIndexDelta = pageContentIndex - otherPageContentIndex;
    if (pageContentIndexDelta !== 0) return pageContentIndexDelta;

    // Same Page Content, Sort by position of quiz in content of page content
    const pageContent = orderedPageContents[pageContentIndex];
    return compareIndexOfQuizInContent(pageContent.body, quiz.id, otherQuiz.id);
  });

  const getQuizIndex = (quizId: string) => {
    return orderedQuizzes.findIndex((quiz) => quiz.id === quizId);
  };

  return {
    orderedPages,
    orderedPageContents,
    orderedQuizzes,
    getQuizIndex,
  };
};

export const compareIndexOfQuizInContent = (
  content: JSONContent,
  quizId: string,
  otherQuizId: string,
): number => {
  if (content?.attrs?.quizId === quizId) return -1;
  if (content?.attrs?.quizId === otherQuizId) return 1;

  if (content.content) {
    for (const innerContent of content.content) {
      const compareNumber = compareIndexOfQuizInContent(
        innerContent,
        quizId,
        otherQuizId,
      );
      if (compareNumber !== 0) return compareNumber;
    }
  }

  return 0;
};

export const hasQuizInContent = (content: JSONContent, quizId: string) => {
  if (content?.attrs?.quizId === quizId) return true;

  if (content.content) {
    for (const innerContent of content.content) {
      const hasQuiz = hasQuizInContent(innerContent, quizId);
      if (hasQuiz) return true;
    }
  }

  return false;
};

export default useQuiz;
