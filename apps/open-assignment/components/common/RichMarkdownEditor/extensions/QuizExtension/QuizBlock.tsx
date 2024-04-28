import { Empty, Tooltip, Segmented, Space } from "antd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 } from "uuid";

import {
  BarChartOutlined,
  CheckOutlined,
  MoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import {
  ANSWER_QUIZ,
  CLONE_QUIZ,
  CREATE_QUIZ,
  CREATE_QUIZ_STRUCTURE,
  UPDATE_QUIZ_TITLE,
} from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";
import {
  AnswerQuiz,
  CloneQuiz,
  CreateQuiz,
  CreateQuizStructure,
  QuizType,
  GetDocumentDetail_documentGet_quizzes as IDocumentQuiz,
} from "graphql/types";
import { debounce } from "lodash";
import { EditorView } from "prosemirror-view";
import { copyBlock } from "@open-assignment/editor/dist/util/copyBlock";
import useDocumentPermission from "hook/UseDocumentPermission";
import { DocumentPermission } from "util/permission";
import { Trans } from "@lingui/macro";

import Loading from "components/Loading";
import SingleChoice from "./SingleChoice";
import { isZeroUUIDString } from "../../utils";
import QuizDropdownMenu from "./QuizSetting/QuizDropdownMenu";
import { QuizAttrs, ViewMode } from "./type";
import MultipleChoice from "./MultipleChoice";
import { BlockHeaderWrapper, QuizTitle } from "../../BlockComponents";
import { TextButtonBlock } from "../../../Button";
import {
  BlockBodyContainer,
  BlockContainer,
} from "../../BlockComponents/styles";
import useQuizStore from "context/ZustandQuizStore";
import { Metadata } from "util/BlockUtil";
import { useQuizzesInOrder } from "hook/UseQuizInOrder";

export type QuizBlockProps = {
  documentId: string;
  attrs: QuizAttrs;
  onChangeAttrs: (newAttrs: QuizAttrs) => void;
  handleDelete: () => void;
  handleSelectAndCopy: () => void;
  view?: EditorView;
  isSelected: boolean;
};

const QuizBlock = ({
  documentId,
  attrs,
  handleDelete,
  onChangeAttrs,
  handleSelectAndCopy,
  view,
  isSelected,
}: QuizBlockProps) => {
  const initQuizLoading = useRef(false);
  const quizRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Default);
  const [quizStructureId, setQuizStructureId] = useState<string | undefined>();

  const [openSetting, setOpenSetting] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<IDocumentQuiz>();

  const quizzes = useQuizStore((state) => state.quizzes);
  const updateStructureQuizzes = useQuizStore(
    (state) => state.updateStructureQuizzes,
  );
  const updateQuizStore = useQuizStore((state) => state.updateStore);
  const updateQuizzes = useQuizStore((state) => state.updateQuizzes);

  const documentAllow = useDocumentPermission();
  const orderingQuizzes = useQuizzesInOrder();

  const [createQuizStructure] = useMutation<CreateQuizStructure>(
    CREATE_QUIZ_STRUCTURE,
    {
      onError: handleError,
    },
  );
  const [createQuiz] = useMutation<CreateQuiz>(CREATE_QUIZ, {
    onError: handleError,
  });
  const [answerQuiz] = useMutation<AnswerQuiz>(ANSWER_QUIZ, {
    onError: handleError,
  });
  const [updateQuizTitle] = useMutation(UPDATE_QUIZ_TITLE, {
    onError: handleError,
  });
  const [cloneQuiz, { loading: loadingCloneQuiz }] = useMutation<CloneQuiz>(
    CLONE_QUIZ,
    {
      onError: () => {
        onChangeAttrs({
          originalQuizId: undefined,
        });
      },
      onCompleted: () => {
        onChangeAttrs({
          originalQuizId: undefined,
        });
      },
    },
  );

  useEffect(() => {
    if (!quizzes || !attrs?.quizId) return;
    const quizFromStore = quizzes.get(attrs.quizId);
    if (!quizFromStore) return;
    setCurrentQuiz(quizFromStore);
    quizFromStore?.structure && setQuizStructureId(quizFromStore.structure.id);
  }, [attrs.quizId, quizzes.get(attrs.quizId)]);

  const initQuiz = async (quizStructureId: string) => {
    initQuizLoading.current = true;
    if (!documentId) return;

    // Create Structure and create quiz
    const { data } = await createQuizStructure({
      variables: {
        data: {
          id: quizStructureId,
          quizType: attrs.quizzType || QuizType.SINGLE_CHOICE,
          quizTitle: "",
          quizBody: ["", "", "", ""],
          quizAnswer: {},
        },
      },
    });

    if (!data) return;
    setQuizStructureId(data.quizCreateStructure.id);

    const { data: quizData } = await createQuiz({
      variables: {
        data: {
          id:
            !attrs.quizId || isZeroUUIDString(attrs.quizId)
              ? v4().toString()
              : attrs.quizId,
          documentId,
          quizStructureId: data.quizCreateStructure.id,
        },
      },
      onCompleted: (data: CreateQuiz) => {
        updateQuizzes([data.quizCreate]);
      },
    });

    if (!quizStructureId) {
      setQuizStructureId(data.quizCreateStructure.id);
    }

    if (quizData && quizData.quizCreate.id !== attrs.quizId) {
      onChangeAttrs({
        quizId: quizData.quizCreate.id,
      });
      initQuizLoading.current = false;
    }
  };

  useEffect(() => {
    if (
      isZeroUUIDString(attrs.quizId) &&
      !initQuizLoading.current &&
      !currentQuiz
    ) {
      initQuiz(v4().toString());
    }
  }, [attrs.quizId, currentQuiz]);

  useEffect(() => {
    if (
      attrs.originalQuizId &&
      !isZeroUUIDString(attrs.quizId) &&
      !isZeroUUIDString(attrs.originalQuizId) &&
      !loadingCloneQuiz &&
      documentId
    ) {
      // Clone quiz
      cloneQuiz({
        variables: {
          fromQuizId: attrs.originalQuizId,
          toQuizId: attrs.quizId,
          toDocumentId: documentId,
        },
      });
    }
  }, [attrs.originalQuizId]);

  const answerQuizDebounce = useCallback(
    debounce(async (quizId: string, answer: Metadata) => {
      updateQuizStore(quizId, answer, documentId);
      const quizType = quizzes.get(quizId)?.structure?.quizType;
      let formatAnswer = undefined;
      if (quizType === QuizType.SINGLE_CHOICE) {
        const quizData = quizzes.get(attrs.quizId);
        const options = quizData?.structure?.quizBody
          ? [...quizData.structure.quizBody]
          : [];
        formatAnswer = options[answer.answer.indexAnswer];
      }

      if (quizType === QuizType.MULTIPLE_CHOICE)
        formatAnswer = answer.answer.multipleIndexAnswer;

      await answerQuiz({
        variables: {
          data: {
            quizId,
            answer: { answer: formatAnswer },
          },
        },
      });
    }, 300),
    [],
  );

  const updateQuizTitleDebounce = useMemo(
    () =>
      debounce(async (quizStructureId: string, quizTitle: string) => {
        await updateQuizTitle({
          variables: {
            quizStructureId,
            title: quizTitle,
          },
        });
      }, 500),
    [],
  );

  const onChangeTitle = async (quizTitle: string) => {
    onChangeAttrs({
      quizTitle,
    });

    if (currentQuiz?.structure?.id) {
      await updateQuizTitleDebounce(currentQuiz.structure.id, quizTitle);
    }
  };

  if (!documentId) {
    return <Loading />;
  }

  // Select review submission or Teacher in Assignment Document
  // 1. Submission Document + Has Preview Submission;
  // 2. Submission Document + Owner is submitted;
  // 3. choose an answer

  const renderQuestion = () => {
    switch (currentQuiz?.structure?.quizType) {
      case QuizType.SINGLE_CHOICE:
        return (
          <SingleChoice
            attrs={attrs}
            documentId={documentId}
            answer={answerQuizDebounce}
            viewMode={viewMode}
          />
        );
      case QuizType.MULTIPLE_CHOICE:
        return (
          <MultipleChoice
            attrs={attrs}
            answer={answerQuizDebounce}
            viewMode={viewMode}
            documentId={documentId}
          />
        );
      default:
        return <Empty />;
    }
  };

  const title = attrs.quizTitle || currentQuiz?.structure?.quizTitle || "";
  const quizIndex = orderingQuizzes?.findIndex(
    (q) => q.quizId === attrs.quizId,
  );

  return (
    <BlockContainer
      ref={quizRef}
      id={attrs.quizId}
      onCopy={(event) => {
        return copyBlock(view, event as any);
      }}
      $isSelected={isSelected}
    >
      <BlockHeaderWrapper>
        <QuizTitle>{`Q${quizIndex + 1}. ${title}`}</QuizTitle>
        <Space size={0}>
          {documentAllow(DocumentPermission.ManageDocument) && (
            <Segmented
              options={[
                {
                  label: <CheckOutlined />,
                  value: ViewMode.Default,
                },
                {
                  label: <BarChartOutlined />,
                  value: ViewMode.Report,
                },
              ]}
              // @ts-ignore
              onChange={setViewMode}
            />
          )}
          {!isZeroUUIDString(attrs.quizId) &&
            currentQuiz &&
            documentAllow(DocumentPermission.ManageDocument) && (
              <Tooltip title={<Trans>Quiz Settings</Trans>}>
                <TextButtonBlock
                  margin="0"
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => setOpenSetting(true)}
                />
              </Tooltip>
            )}
          {!isZeroUUIDString(attrs.quizId) &&
            currentQuiz &&
            documentAllow(DocumentPermission.ManageDocument) && (
              <QuizDropdownMenu
                documentId={documentId}
                attrs={attrs}
                data={currentQuiz}
                onChangeTitle={onChangeTitle}
                handleDelete={handleDelete}
                quizStructureId={quizStructureId}
                refetch={updateStructureQuizzes}
                openSetting={openSetting}
                setOpenSetting={setOpenSetting}
                onSelectAndCopy={handleSelectAndCopy}
              >
                <TextButtonBlock
                  margin="0"
                  type="text"
                  icon={<MoreOutlined />}
                />
              </QuizDropdownMenu>
            )}
        </Space>
      </BlockHeaderWrapper>
      <BlockBodyContainer>{renderQuestion()}</BlockBodyContainer>
    </BlockContainer>
  );
};

export default QuizBlock;
