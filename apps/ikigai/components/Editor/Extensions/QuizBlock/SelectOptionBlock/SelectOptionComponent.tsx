import React, { useState } from "react";
import { NodeViewProps } from "@tiptap/core";
import { IconButton } from "@radix-ui/themes";

import { useOrderedQuizzes } from "hook/UseQuiz";
import { isEmptyUuid } from "util/FileUtil";
import { DocumentActionPermission, QuizType, Role } from "graphql/types";
import QuizBlockWrapper from "../QuizBlockWrapper";
import { SettingIcon } from "components/common/IconSvg";
import { QuizComponentProps } from "../type";
import SelectOptionSetting from "./SelectOptionSetting";
import DoingSelectOption from "./DoingSelectOption";
import usePermission from "hook/UsePermission";
import useAuthUserStore from "store/AuthStore";
import useDocumentStore from "store/DocumentStore";
import ReviewSelectOption from "./ReviewSelectOption";

const SelectOptionComponent = (props: NodeViewProps) => {
  const allow = usePermission();
  const { getQuizIndex } = useOrderedQuizzes();
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;
  const quizIndex = isEmptyUuid(quizId) ? 0 : getQuizIndex(quizId);
  const [showSetting, setShowSetting] = useState(false);

  return (
    <QuizBlockWrapper
      quizType={QuizType.SELECT_OPTION}
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
        <SelectOption
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
              <SettingIcon width="16" height="16" />
            </IconButton>
          </div>
        )}
      </div>
      {allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
        <SelectOptionSetting
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

const SelectOption = (props: QuizComponentProps) => {
  const role = useAuthUserStore((state) => state.role);
  const document = useDocumentStore((state) => state.activeDocument);
  const isSubmission = !!document.submission;
  const isDoingSubmission = isSubmission && !document.submission.submitAt;
  const isStudent = role === Role.STUDENT;

  if (isStudent && isDoingSubmission) {
    return <DoingSelectOption {...props} />;
  }

  if (isSubmission) {
    return (
      <ReviewSelectOption userId={document.submission.user.id} {...props} />
    );
  }

  return <DoingSelectOption {...props} />;
};

export default SelectOptionComponent;
