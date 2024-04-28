import useDocumentStore from "context/ZustandDocumentStore";
import { useQuizzesInOrder } from "./UseQuizInOrder";
import useQuizStore from "context/ZustandQuizStore";

export const useCorrectAnswers = () => {
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const quizzes = useQuizStore((state) => state.quizzes);
  const orderingQuizzes = useQuizzesInOrder();
  const submission = masterDocument?.submission;
  const correctAnswers = orderingQuizzes.reduce((preVal, currVal) => {
    const answer = quizzes
      .get(currVal.quizId)
      ?.answers?.find((a) => a.userId === submission?.user?.id);
    return preVal + (answer?.isCorrect ? 1 : 0);
  }, 0);
  return correctAnswers;
};
