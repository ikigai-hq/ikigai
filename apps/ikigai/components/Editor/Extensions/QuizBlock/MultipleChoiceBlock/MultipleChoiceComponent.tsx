import { NodeViewProps } from "@tiptap/core";
import { useState } from "react";

import { DocumentActionPermission, QuizType, Role } from "graphql/types";
import QuizBlockWrapper from "../QuizBlockWrapper";
import usePermission from "hook/UsePermission";
import { isEmptyUuid } from "util/FileUtil";
import { useOrderedQuizzes } from "hook/UseQuiz";
import { QuizComponentProps } from "../type";
import useAuthUserStore from "store/AuthStore";
import useDocumentStore from "store/DocumentStore";
import DoingMultipleChoice from "./DoingMultipleChoice";
import MultipleChoiceSetting from "./MultipleChoiceSetting";
import ReviewMultipleChoice from "./ReviewMultipleChoice";

const MultipleChoiceBlockComponent = (props: NodeViewProps) => {
  const { getQuizIndex } = useOrderedQuizzes();
  const allow = usePermission();
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;
  const quizIndex = isEmptyUuid(quizId) ? 0 : getQuizIndex(quizId);
  const [showSetting, setShowSetting] = useState(false);

  return (
    <QuizBlockWrapper
      quizType={QuizType.MULTIPLE_CHOICE}
      nodeViewProps={props}
      showSetting={
        props.selected && allow(DocumentActionPermission.EDIT_DOCUMENT)
      }
      onClickSetting={() => setShowSetting(!showSetting)}
    >
      <MultipleChoice
        parentContentId={pageContentId}
        quizId={quizId}
        quizIndex={quizIndex}
      />
      <MultipleChoiceSetting
        parentContentId={pageContentId}
        quizId={quizId}
        showSetting={showSetting}
        setShowSetting={setShowSetting}
      />
    </QuizBlockWrapper>
  );
};

export const MultipleChoice = (props: QuizComponentProps) => {
  const role = useAuthUserStore((state) => state.role);
  const document = useDocumentStore((state) => state.activeDocument);
  const isSubmission = !!document.submission;
  const isDoingSubmission = isSubmission && !document.submission.submitAt;
  const isStudent = role === Role.STUDENT;

  if (isStudent && isDoingSubmission) {
    return <DoingMultipleChoice {...props} />;
  }

  if (isSubmission) {
    return (
      <ReviewMultipleChoice {...props} userId={document.submission.user.id} />
    );
  }

  return <DoingMultipleChoice {...props} />;
};

export default MultipleChoiceBlockComponent;
