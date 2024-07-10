import { NodeViewWrapper } from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import React, { useEffect, useState } from "react";

import { EMPTY_UUID, isEmptyUuid } from "util/FileUtil";
import { QuizType } from "graphql/types";
import Loading from "components/Loading";
import { ExtensionWrapper } from "components/base/ExtensionComponentUtil";
import useQuiz from "hook/UseQuiz";

export type QuizBlockWrapperProps = {
  quizType: QuizType;
  children: React.ReactNode;
  nodeViewProps: NodeViewProps;
};

const QuizBlockWrapper = ({
  quizType,
  children,
  nodeViewProps: props,
}: QuizBlockWrapperProps) => {
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;
  const originalQuizId = props.node.attrs.originalQuizId;

  const { cloneQuiz, upsertQuiz } = useQuiz(quizId, pageContentId);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initialize();
  }, [quizId]);

  const initialize = async () => {
    setInitializing(true);

    if (isEmptyUuid(quizId)) {
      if (isEmptyUuid(originalQuizId)) {
        await upsertQuizBlock();
      } else {
        await cloneQuizBlock();
      }
    }

    setInitializing(false);
  };

  const cloneQuizBlock = async () => {
    const quiz = await cloneQuiz(originalQuizId);
    if (quiz) {
      props.updateAttributes({
        quizId: quiz.id,
        originalQuizId: EMPTY_UUID,
      });
    }
  };

  const upsertQuizBlock = async () => {
    const quiz = await upsertQuiz(quizType, {}, {});

    if (quiz) {
      props.updateAttributes({ quizId: quiz.id });
    }
  };

  if (initializing) {
    return (
      <NodeViewWrapper>
        <ExtensionWrapper selected={props.selected}>
          <Loading />
        </ExtensionWrapper>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <ExtensionWrapper selected={props.selected}>{children}</ExtensionWrapper>
    </NodeViewWrapper>
  );
};

export default QuizBlockWrapper;
