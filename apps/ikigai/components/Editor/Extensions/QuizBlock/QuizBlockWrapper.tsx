import { NodeViewWrapper } from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import React, { useEffect, useState } from "react";

import { EMPTY_UUID, isEmptyUuid } from "util/FileUtil";
import { QuizType } from "graphql/types";
import Loading from "components/Loading";
import { ExtensionWrapper } from "components/base/ExtensionComponentUtil";
import useQuiz from "hook/UseQuiz";
import styled from "styled-components";
import { IconButton } from "@radix-ui/themes";
import { SettingIcon } from "components/common/IconSvg";

export type QuizBlockWrapperProps = {
  quizType: QuizType;
  children: React.ReactNode;
  nodeViewProps: NodeViewProps;
  showSetting: boolean;
  onClickSetting?: () => void;
  inline?: boolean;
};

const QuizBlockWrapper = ({
  quizType,
  children,
  nodeViewProps: props,
  showSetting,
  onClickSetting,
  inline = false,
}: QuizBlockWrapperProps) => {
  const pageContentId = props.extension.options.pageContentId;
  const quizId = props.node.attrs.quizId;
  const originalQuizId = props.node.attrs.originalQuizId;

  const { cloneQuiz, upsertQuiz } = useQuiz<{}, {}, {}>(
    quizType,
    quizId,
    pageContentId,
  );
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
    const quiz = await upsertQuiz({}, {});

    if (quiz) {
      props.updateAttributes({ quizId: quiz.id });
    }
  };

  if (initializing) {
    return (
      <NodeViewWrapper as={inline ? "span" : undefined}>
        <ExtensionWrapper selected={props.selected} inline={inline}>
          <Loading />
        </ExtensionWrapper>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as={inline ? "span" : undefined}>
      <ExtensionWrapper selected={props.selected} inline={inline}>
        {children}
        <ExtensionMenu $show={showSetting && !inline}>
          <div>
            <IconButton
              size="1"
              variant="soft"
              color={"gray"}
              onClick={onClickSetting}
            >
              <SettingIcon width="16" height="16" />
            </IconButton>
          </div>
        </ExtensionMenu>
      </ExtensionWrapper>
    </NodeViewWrapper>
  );
};

const ExtensionMenu = styled.div<{ $show: boolean }>`
  position: absolute;
  right: 10px;
  top: 10px;
  display: ${(props) => (props.$show ? "unset" : "none")};
`;

export default QuizBlockWrapper;
