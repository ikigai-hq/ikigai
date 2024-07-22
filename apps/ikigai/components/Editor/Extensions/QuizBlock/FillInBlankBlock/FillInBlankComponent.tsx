import { NodeViewProps } from "@tiptap/core";
import React, { useState } from "react";
import { IconButton } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons";

import { DocumentActionPermission, QuizType, Role } from "graphql/types";
import usePermission from "hook/UsePermission";
import { useOrderedQuizzes } from "hook/UseQuiz";
import { isEmptyUuid } from "util/FileUtil";
import QuizBlockWrapper from "../QuizBlockWrapper";
import { QuizComponentProps } from "../type";
import useAuthUserStore from "store/AuthStore";
import useDocumentStore from "store/DocumentStore";
import DoingFillInBlank from "./DoingFillInBlank";
import ReviewFillInBlank from "./ReviewFillInBlank";
import FillInBlankSetting from "./FillInBlankSetting";

const FillInBlankComponent = (props: NodeViewProps) => {
  const allow = usePermission();
  const { getQuizIndex } = useOrderedQuizzes();
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;
  const quizIndex = isEmptyUuid(quizId) ? 0 : getQuizIndex(quizId);
  const [showSetting, setShowSetting] = useState(false);

  return (
    <QuizBlockWrapper
      quizType={QuizType.FILL_IN_BLANK}
      nodeViewProps={props}
      showSetting
      inline={true}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          padding: 2,
        }}
      >
        <FillInBlank
          pageContentId={pageContentId}
          quizId={quizId}
          quizIndex={quizIndex}
        />
        {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
          <div>
            <IconButton
              size="1"
              variant="soft"
              color={"gray"}
              onClick={() => setShowSetting(true)}
            >
              <GearIcon width="16" height="16" />
            </IconButton>
          </div>
        )}
      </div>
      {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
        <FillInBlankSetting
          showSetting={showSetting}
          setShowSetting={setShowSetting}
          pageContentId={pageContentId}
          quizId={quizId}
          quizIndex={quizIndex}
        />
      )}
    </QuizBlockWrapper>
  );
};

const FillInBlank = (props: QuizComponentProps) => {
  const role = useAuthUserStore((state) => state.role);
  const document = useDocumentStore((state) => state.activeDocument);
  const isSubmission = !!document.submission;
  const isDoingSubmission = isSubmission && !document.submission.submitAt;
  const isStudent = role === Role.STUDENT;
  if (isStudent && isDoingSubmission) {
    return <DoingFillInBlank {...props} />;
  }

  if (isSubmission) {
    return (
      <ReviewFillInBlank {...props} userId={document.submission.user.id} />
    );
  }

  return <DoingFillInBlank {...props} />;
};

export default FillInBlankComponent;
