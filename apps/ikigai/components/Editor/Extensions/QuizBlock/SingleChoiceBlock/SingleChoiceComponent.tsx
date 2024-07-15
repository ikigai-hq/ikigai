import { NodeViewProps } from "@tiptap/core";
import { useState } from "react";

import { DocumentActionPermission, QuizType, Role } from "graphql/types";
import QuizBlockWrapper from "../QuizBlockWrapper";
import usePermission from "hook/UsePermission";
import { SingleChoiceProps } from "./type";
import SingleChoiceSetting from "./SingleChoiceSetting";
import useAuthUserStore from "store/AuthStore";
import useDocumentStore from "store/DocumentStore";
import DoingSingleChoice from "./DoingSingleChoice";
import ReviewSingleChoice from "./ReviewSingleChoice";
import { isEmptyUuid } from "util/FileUtil";
import { useOrderedQuizzes } from "hook/UseQuiz";

const SingleChoiceBlockComponent = (props: NodeViewProps) => {
  const { getQuizIndex } = useOrderedQuizzes();
  const allow = usePermission();
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;
  const quizIndex = isEmptyUuid(quizId) ? 0 : getQuizIndex(quizId);
  const [showSetting, setShowSetting] = useState(false);

  return (
    <QuizBlockWrapper
      quizType={QuizType.SINGLE_CHOICE}
      nodeViewProps={props}
      showSetting={
        props.selected && allow(DocumentActionPermission.EDIT_DOCUMENT)
      }
      onClickSetting={() => setShowSetting(!showSetting)}
    >
      <SingleChoice
        parentContentId={pageContentId}
        quizId={quizId}
        quizIndex={quizIndex}
      />
      <SingleChoiceSetting
        parentContentId={pageContentId}
        quizId={quizId}
        showSetting={showSetting}
        setShowSetting={setShowSetting}
      />
    </QuizBlockWrapper>
  );
};

export const SingleChoice = (props: SingleChoiceProps) => {
  const role = useAuthUserStore((state) => state.role);
  const document = useDocumentStore((state) => state.activeDocument);
  const isSubmission = !!document.submission;
  const isDoingSubmission = isSubmission && !document.submission.submitAt;
  const isStudent = role === Role.STUDENT;

  if (isStudent && isDoingSubmission) {
    return <DoingSingleChoice {...props} />;
  }

  if (isSubmission) {
    return (
      <ReviewSingleChoice userId={document.submission.user.id} {...props} />
    );
  }

  return <DoingSingleChoice {...props} />;
};

export default SingleChoiceBlockComponent;
