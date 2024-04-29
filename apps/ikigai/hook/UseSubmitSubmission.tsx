import useDocumentStore from "context/ZustandDocumentStore";
import usePageBlockStore from "context/ZustandPageBlockStore";
import { getNowAsSec } from "util/Time";
import { GetDocumentDetail_documentGet as IDocument } from "graphql/types";
import useQuizStore from "context/ZustandQuizStore";
import { useRouter } from "next/router";
import { useModal } from "./UseModal";
import { ConfirmPopup } from "util/ConfirmPopup";
import { t } from "@lingui/macro";
import { useState } from "react";
import { toast } from "react-hot-toast";

const useSubmitSubmission = (
  document: IDocument,
): {
  deadline: number;
  loading: boolean;
  onSubmit: () => Promise<void>;
  backToPreviousPage: () => void;
} => {
  const { back, replace } = useRouter();
  const { modal } = useModal();
  const [submitLoading, setSubmitLoading] = useState(false);

  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const submitSubmission = useDocumentStore((state) => state.submitSubmission);
  const countUncompletedQuizzes = useQuizStore(
    (state) => state.countUncompletedQuizzes,
  );
  const mapPageBlockData = usePageBlockStore((state) => state.mapPageBlockData);
  const pageBlocks = usePageBlockStore((state) => state.pageBlocks);

  const submission = document.submission;
  const testDuration = activeDocument.submission
    ? activeDocument.submission.assignment.testDuration
    : 0;
  const startAt = activeDocument.submission
    ? activeDocument.submission.startAt
    : 0;
  const spendingTime = getNowAsSec() - startAt;
  const deadline = testDuration
    ? Date.now() + (testDuration - spendingTime) * 1000
    : undefined;

  const allowSaveAndExit = submission.allowRework;

  const backToPreviousPage = () => {
    if (history.length >= 1) {
      back();
    } else {
      replace("/");
    }
  };

  const onSubmit = async () => {
    const unCompleteQuizzes = countUncompletedQuizzes(
      activeDocument,
      pageBlocks.filter((pb) =>
        mapPageBlockData
          .get(activeDocument.id)
          ?.some((data) => data.id === pb.id),
      ),
    );
    const leftTime =
      submission.assignment.testDuration + submission.startAt > getNowAsSec()
        ? Math.round(
            (submission.assignment.testDuration +
              submission.startAt -
              getNowAsSec()) /
              60,
          )
        : 0;

    modal.confirm(
      ConfirmPopup({
        title: t`Are your sure to submit the assignment?`,
        okText: t`Submit`,
        // eslint-disable-next-line max-len
        content: t`If you proceed, this exam will be submitted. You have ${leftTime} minutes left on this assignment and ${
          unCompleteQuizzes.length || 0
        } non complete quizzes.`,
        onOk: async () => {
          setSubmitLoading(true);
          await submitSubmission();
          toast.success(t`Submit successfully!`);
          backToPreviousPage();
          setSubmitLoading(false);
        },
        cancelText: allowSaveAndExit ? t`Save and Exit` : t`Cancel`,
        onCancel: () => {
          if (allowSaveAndExit) {
            backToPreviousPage();
          }
        },
      }) as any,
    );
  };

  return { deadline, loading: submitLoading, onSubmit, backToPreviousPage };
};

export default useSubmitSubmission;
