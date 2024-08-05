import { t, Trans } from "@lingui/macro";
import { Button, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { useRef, useState } from "react";
import { useMutation } from "@apollo/client";

import { handleError } from "graphql/ApolloClient";
import { ReviewGeneratedQuizzes } from "./ReviewGeneratedQuizzes";
import { SelectedGeneratedQuizzes } from "./SelectedGeneratedQuizzes";
import Modal from "../base/Modal";
import {
  GenerateQuizzes,
  QuizType,
  GenerateQuizzes_quizGenerateByAi_quizzes as IGeneratedQuiz,
} from "graphql/types";
import InputNumber from "../base/InputNumber";
import { GENERATE_QUIZZES } from "graphql/mutation/DocumentMutation";
import useAIStore from "store/AIStore";

export type QuizGeneratorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const QuizGenerator = ({ open, onOpenChange }: QuizGeneratorProps) => {
  const maxAiUsage = useAIStore((state) => state.maxAIUsagePerDay);
  const usageOfToday = useRef(useAIStore.getState().usageOfToday);
  const [maxWidth, setMaxWidth] = useState("45vw");

  const isReachedMaxUsage = usageOfToday.current >= maxAiUsage;
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      content={
        isReachedMaxUsage ? (
          <div>
            <Text>
              <Trans>
                You've reached maximum usage of Ikigai AI today (max{" "}
                {maxAiUsage} requests per day).
              </Trans>
            </Text>
          </div>
        ) : (
          <QuizGeneratorContent
            setMaxWidth={setMaxWidth}
            onClose={() => onOpenChange(false)}
          />
        )
      }
      title={t`🪄Generate Quiz by Ikigai AI🪄`}
      description={t`
        Ikigai AI to generate quizzes for you with your teaching resources such as
        pdf, docx, web, youtube video, etc.
      `}
      showClose={false}
      maxWidth={maxWidth}
    >
      <></>
    </Modal>
  );
};

enum GenerateStep {
  GENERATE,
  PICK,
}

export type QuizGenerateContentProps = {
  onClose: () => void;
  setMaxWidth: (maxWidth: "45vw" | "80vw") => void;
};

const QuizGeneratorContent = ({
  onClose,
  setMaxWidth,
}: QuizGenerateContentProps) => {
  const increaseUsageToday = useAIStore((state) => state.increaseUsageOfToday);
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [quizType, setQuizType] = useState(QuizType.SINGLE_CHOICE);
  const [totalQuiz, setTotalQuiz] = useState(5);
  const [step, setStep] = useState(GenerateStep.GENERATE);
  const [availableQuizzes, setAvailableQuizzes] = useState<IGeneratedQuiz[]>(
    [],
  );
  const [selectedQuizzes, setSelectedQuizzes] = useState<IGeneratedQuiz[]>([]);
  const [alreadyGenerate, setAlreadyGenerate] = useState(false);

  const [generateQuizzes, { loading }] = useMutation<GenerateQuizzes>(
    GENERATE_QUIZZES,
    {
      onError: handleError,
    },
  );

  const onGenerate = async () => {
    const previousQuizzes = [...availableQuizzes, ...selectedQuizzes]
      .map((quiz) => quiz.question)
      .join(", ");

    let userContext = context;
    if (previousQuizzes.length > 0) {
      userContext = `Previous questions: ${previousQuizzes}.\nDo not generate same question with previous question. \n\n ${userContext}`;
    }
    const { data } = await generateQuizzes({
      variables: {
        quizType,
        data: {
          userContext,
          subject,
          totalQuizzes: totalQuiz,
        },
      },
    });

    if (data) {
      setMaxWidth("80vw");
      setAlreadyGenerate(true);
      setStep(GenerateStep.PICK);
      setAvailableQuizzes(data.quizGenerateByAi.quizzes);
      increaseUsageToday(1);
    }
  };

  const onSelectQuiz = (index: number) => {
    const quizzes = availableQuizzes.splice(index, 1);
    setSelectedQuizzes([...selectedQuizzes, ...quizzes]);
    setAvailableQuizzes([...availableQuizzes]);
  };

  const onDeselectQuiz = (index: number) => {
    const quizzes = selectedQuizzes.splice(index, 1);
    setAvailableQuizzes([...availableQuizzes, ...quizzes]);
    setSelectedQuizzes([...selectedQuizzes]);
  };

  const selectAll = () => {
    setSelectedQuizzes([...selectedQuizzes, ...availableQuizzes]);
    setAvailableQuizzes([]);
  };

  return (
    <div style={{ display: "flex" }}>
      {step === GenerateStep.GENERATE && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            paddingRight: 10,
          }}
        >
          <div>
            <Text size="3" weight="bold">
              <Trans>Subject</Trans>
            </Text>
            <TextField.Root
              placeholder={t`Subject, 120 chars max`}
              maxLength={120}
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
            />
          </div>
          <div>
            <Text size="3" weight="bold">
              <Trans>Details</Trans>
            </Text>
            <TextArea
              placeholder={t`Typing more details`}
              value={context}
              onChange={(e) => setContext(e.currentTarget.value)}
              rows={5}
            />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <Select.Root
                value={quizType}
                onValueChange={(value) => setQuizType(QuizType[value])}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Group>
                    <Select.Item value={QuizType.SINGLE_CHOICE}>
                      <Trans>Single choice</Trans>
                    </Select.Item>
                    <Select.Item value={QuizType.MULTIPLE_CHOICE}>
                      <Trans>Multiple Choice</Trans>
                    </Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                gap: 5,
                alignItems: "center",
                justifyContent: "right",
              }}
            >
              <Text weight={"medium"} size="2">
                <Trans>Total quiz</Trans>
              </Text>
              <div style={{ width: 200 }}>
                <InputNumber
                  value={totalQuiz}
                  onChange={setTotalQuiz}
                  precision={0}
                />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, justifyContent: "right" }}>
            {!alreadyGenerate && (
              <Button variant={"soft"} color={"gray"} onClick={onClose}>
                <Trans>Close</Trans>
              </Button>
            )}
            <Button onClick={onGenerate} loading={loading} disabled={loading}>
              <Trans>Generate Quizzes</Trans>
            </Button>
          </div>
        </div>
      )}
      {step === GenerateStep.PICK && (
        <div style={{ flex: 1 }}>
          <ReviewGeneratedQuizzes
            quizzes={availableQuizzes}
            onSelect={onSelectQuiz}
            selectAll={selectAll}
            backToGenerate={() => setStep(GenerateStep.GENERATE)}
          />
        </div>
      )}
      {alreadyGenerate && (
        <div style={{ flex: 1 }}>
          <SelectedGeneratedQuizzes
            quizzes={selectedQuizzes}
            onClose={onClose}
            onDeselectQuiz={onDeselectQuiz}
          />
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
