import useDocumentStore from "context/ZustandDocumentStore";
import useQuizStore from "context/ZustandQuizStore";
import useSubmissionStatus from "./UseSubmissionStatus";
import { DocumentType, getDocumentType } from "../util/DocumentHelper";
import { QuizType } from "graphql/types";
import {
  StatusAnswer,
  colorQuestion,
} from "components/Document/RightPanel/ColorLegend";
import { isEmpty } from "lodash";

const useFillAnswer = (
  quizId: string,
): { backgroundColor: string; textColor: string } => {
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const quiz = useQuizStore((state) => state.quizzes.get(quizId));
  const quizDataBlocks = useQuizStore((state) =>
    state.mapQuizBlockData.get(quiz?.documentId),
  );
  const { isDoingSubmission, isSubmissionDocument, isStudent } =
    useSubmissionStatus(activeDocument);
  const quizMetadata = quizDataBlocks?.find((q) => q.id === quizId)?.metadata;
  const userIdSubmission = activeDocument?.submission?.userId;
  const ownerAnswer = quiz?.answers?.find((a) => a.userId === userIdSubmission);
  const isCorrect = ownerAnswer?.isCorrect;
  const isEmptyAnswer = ownerAnswer
    ? ownerAnswer.answer?.answer?.length === 0
    : true;
  const quizType = quiz?.structure?.quizType;
  const structureAnswer = quiz?.structureAnswer;
  let statusAnswer: StatusAnswer = StatusAnswer.DEFAULT;

  // Single choice format: correctOption: number.
  // Multiple choice and fill in blank format: correctOptions: <number | string>[];
  const isNotSettingQuizAnswer = (type: QuizType) => {
    if (isEmpty(structureAnswer)) return true;
    switch (type) {
      case QuizType.MULTIPLE_CHOICE:
        return structureAnswer.correctOptions?.length === 0;
      case QuizType.FILL_IN_BLANK:
        return (
          structureAnswer.correctOptions?.length === 1 &&
          isEmpty(structureAnswer.correctOptions[0])
        );
    }
  };

  if (
    getDocumentType(activeDocument) === DocumentType.Assignment &&
    isNotSettingQuizAnswer(quizType)
  ) {
    statusAnswer = StatusAnswer.WARNING;
  }

  if (quizMetadata?.answer?.isAnswered) {
    statusAnswer = StatusAnswer.ANSWERED;
  }

  if (isSubmissionDocument && !isDoingSubmission) {
    if ((isStudent && activeDocument?.submission?.finalGrade) || !isStudent) {
      if (isCorrect) {
        statusAnswer = StatusAnswer.CORRECT;
      }

      if (!isCorrect && !isEmptyAnswer) {
        statusAnswer = StatusAnswer.WRONG;
      }
    }
  }

  return {
    backgroundColor: colorQuestion[statusAnswer].backgroundColor,
    textColor: colorQuestion[statusAnswer].textColor,
  };
};

export default useFillAnswer;
