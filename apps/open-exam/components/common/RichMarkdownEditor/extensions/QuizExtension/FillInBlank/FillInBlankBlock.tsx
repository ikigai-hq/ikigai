import { Button } from "antd";
import styled from "styled-components";
import { SettingOutlined } from "@ant-design/icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { cloneDeep, debounce } from "lodash";

import { TextButton } from "components/common/Button";
import useDocumentPermission from "hook/UseDocumentPermission";
import { DocumentPermission } from "util/permission";
import {
  AnswerQuiz,
  CloneQuiz,
  CreateQuiz,
  CreateQuizStructure,
  QuizType,
} from "graphql/types";
import FillInBlankSetting from "./FillInBlankSetting";
import {
  ANSWER_QUIZ,
  CLONE_QUIZ,
  CREATE_QUIZ,
  CREATE_QUIZ_STRUCTURE,
} from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";
import { copyBlock } from "@openexam/editor/dist/util/copyBlock";
import { EditorView } from "prosemirror-view";
import { QuizTitle } from "../../../BlockComponents";
import useQuizStore from "context/ZustandQuizStore";
import useDocumentStore from "context/ZustandDocumentStore";
import { v4 } from "uuid";
import FillInBlankReview from "./FillInBlankReview";
import { useQuizzesInOrder } from "hook/UseQuizInOrder";

export type FillInBlankProps = {
  documentId: string;
  quizId: string;
  onDelete: () => void;
  view: EditorView;
  onCloneComplete: () => void;
  originalQuizId?: string;
  initialValue?: string;
  onSelect: () => void;
  isSelected: boolean;
};

const FillInBlankBlock = ({
  documentId,
  quizId,
  view,
  originalQuizId,
  onCloneComplete,
  initialValue,
  onSelect,
  isSelected,
}: FillInBlankProps) => {
  const quizData = useQuizStore((state) =>
    state.mapQuizBlockData.get(documentId)?.find((q) => q.id === quizId),
  );
  const updateQuizStore = useQuizStore((state) => state.updateStore);
  const updateQuizzes = useQuizStore((state) => state.updateQuizzes);
  const quizzes = useQuizStore((state) => state.quizzes);

  const config = useDocumentStore((state) => state.documentConfig);
  const documentAllow = useDocumentPermission();

  const orderingQuizzes = useQuizzesInOrder();

  const [openSetting, setOpenSetting] = useState(false);
  const fillInBlankAnswer = useRef<string>(
    quizData?.metadata?.answer?.fillInBlankAnswer || "",
  );
  const [inputFillInBlank, setInputFillInBlank] = useState<string>(
    quizData?.metadata?.answer?.fillInBlankAnswer || "",
  );

  const [cloneQuiz, { loading: loadingCloneQuiz }] = useMutation<CloneQuiz>(
    CLONE_QUIZ,
    {
      onError: onCloneComplete,
      onCompleted: (data) => {
        updateQuizzes([cloneDeep(data.quizClone)]);
        onCloneComplete();
      },
    },
  );
  const [createQuizStructure] = useMutation<CreateQuizStructure>(
    CREATE_QUIZ_STRUCTURE,
    {
      onError: handleError,
    },
  );
  const [createQuiz, { loading: initQuizLoading }] = useMutation<CreateQuiz>(
    CREATE_QUIZ,
    {
      onError: handleError,
    },
  );
  const [answerQuiz] = useMutation<AnswerQuiz>(ANSWER_QUIZ, {
    onError: handleError,
  });

  const createInitialQuiz = async (initialValue: string) => {
    if (!documentId) return;
    // Create Structure and create quiz
    const { data } = await createQuizStructure({
      variables: {
        data: {
          id: v4().toString(),
          quizType: QuizType.FILL_IN_BLANK,
          quizTitle: "",
          quizBody: {},
          quizAnswer: { correctOptions: [initialValue] },
          explanation: "",
        },
      },
    });
    if (!data) return;
    await createQuiz({
      variables: {
        data: {
          id: quizId,
          documentId,
          quizStructureId: data.quizCreateStructure.id,
        },
      },
      onCompleted: (data: CreateQuiz) => {
        updateQuizzes([data.quizCreate]);
      },
    });
  };

  useEffect(() => {
    // We also create quizId when trigger fill in blank node.
    if (!originalQuizId && quizData && !quizzes.get(quizId)) {
      createInitialQuiz(initialValue || "");
    }
  }, [initialValue, originalQuizId]);

  useEffect(() => {
    if (originalQuizId && !loadingCloneQuiz && documentId) {
      // Clone quiz
      cloneQuiz({
        variables: {
          fromQuizId: originalQuizId,
          toQuizId: quizId,
          toDocumentId: documentId,
        },
      });
    }
  }, [originalQuizId, loadingCloneQuiz]);

  const onClickSetting = () => {
    setOpenSetting(true);
  };

  const answerQuizDebounce = useCallback(
    debounce(async (quizId: string, value: string) => {
      updateQuizStore(
        quizId,
        { answer: { isAnswered: !!value, fillInBlankAnswer: value } },
        documentId,
      );
      await answerQuiz({
        variables: {
          data: {
            quizId,
            answer: { answer: value },
          },
        },
      });
    }, 300),
    [],
  );

  const onChangeAnswer = (value: string) => {
    setInputFillInBlank(value);
    answerQuizDebounce(quizId, value);
  };

  const quizIndex = orderingQuizzes?.findIndex((q) => q.quizId === quizId);

  if (config.showQuizReview) {
    return (
      <span>
        &nbsp;
        <FillInBlankContainer
          id={quizId}
          style={{ padding: "7px 7px 8px 7px" }}
        >
          <QuizTitle
            style={{
              cursor: "pointer",
              pointerEvents: "none",
            }}
            onClick={onSelect}
          >
            {`Q${quizIndex + 1}.`}
          </QuizTitle>
          <FillInBlankReview quizId={quizId} />
        </FillInBlankContainer>
      </span>
    );
  }

  return (
    <span>
      &nbsp;
      <FillInBlankContainer
        id={quizId}
        onCopy={(event) => copyBlock(view, event as any)}
        $isSelected={isSelected}
        $hasValue={!!inputFillInBlank}
      >
        <QuizTitle
          style={{
            cursor: "pointer",
            pointerEvents: "none",
          }}
          onClick={onSelect}
        >
          {`Q${quizIndex + 1}.`}
        </QuizTitle>
        <InputFillInBlank
          $hasValue={!!inputFillInBlank}
          contentEditable={documentAllow(DocumentPermission.InteractiveWithTool)}
          onInput={(e) => onChangeAnswer(e.currentTarget.innerText)}
          suppressContentEditableWarning={true}
          onKeyDown={(e) => e.keyCode === 13 && e.preventDefault()}
        >
          {fillInBlankAnswer.current.replace(/(?:\r\n|\r|\n)/g, " ")}
        </InputFillInBlank>
        {documentAllow(DocumentPermission.ManageDocument) && (
          <span style={{ display: "inline-grid" }}>
            <Button
              icon={<SettingOutlined />}
              type={"text"}
              onClick={onClickSetting}
              loading={initQuizLoading || loadingCloneQuiz}
            />
            {quizData && (
              <FillInBlankSetting
                quizId={quizId}
                open={openSetting}
                setOpen={setOpenSetting}
              />
            )}
          </span>
        )}
      </FillInBlankContainer>
    </span>
  );
};

const FillInBlankContainer = styled.span<{
  $isSelected?: boolean;
  $hasValue?: boolean;
}>`
  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.colors.gray[5]};
  padding: 7px;
  line-height: 44px;
  background: ${(props) =>
    props.$isSelected ? props.theme.colors.selection1 : "#ffffff"};
  align-items: baseline;
  white-space: ${({ $hasValue }) => ($hasValue ? "wrap" : "nowrap")};
`;

export const InputFillInBlank = styled.span<{ $hasValue?: boolean }>`
  padding: 0 7px;
  min-width: 65px;
  outline: none;
  line-height: normal;
  display: ${(props) => (props.$hasValue ? "inline" : "inline-block")};
  word-wrap: break-word;
  position: relative;
  outline-width: 0;
  overflow-y: scroll;
  vertical-align: ${(props) => (props.$hasValue ? "unset" : "sub")};
`;

export default FillInBlankBlock;
