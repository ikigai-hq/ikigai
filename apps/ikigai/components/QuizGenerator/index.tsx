import { t, Trans } from "@lingui/macro";
import { Button, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { useRef, useState } from "react";
import { useMutation } from "@apollo/client";

import { handleError } from "graphql/ApolloClient";
import { ReviewGeneratedQuizzes } from "./ReviewGeneratedQuizzes";
import { SelectedGeneratedQuizzes } from "./SelectedGeneratedQuizzes";
import Modal from "../base/Modal";
import { GenerateQuizzes, QuizType } from "graphql/types";
import InputNumber from "../base/InputNumber";
import { GENERATE_QUIZZES } from "graphql/mutation/DocumentMutation";
import useUsageConfigStore, { isUsageValid } from "store/UsageConfigStore";
import { AIGeneratedQuiz } from "store/QuizStore";

export type QuizGeneratorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const QuizGenerator = ({ open, onOpenChange }: QuizGeneratorProps) => {
  const maxAiUsagePerDay = useUsageConfigStore(
    (state) => state.config?.maxAiUsagePerDay,
  );
  const usageOfToday = useRef(useUsageConfigStore.getState().usageOfToday);
  const [maxWidth, setMaxWidth] = useState("45vw");
  const isReachedMaxUsage = isUsageValid(
    "maxAiUsagePerDay",
    usageOfToday.current,
  );

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
                {maxAiUsagePerDay} requests per day).
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
  const increaseUsageToday = useUsageConfigStore(
    (state) => state.increaseUsageOfToday,
  );
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [quizType, setQuizType] = useState(QuizType.SINGLE_CHOICE);
  const [totalQuiz, setTotalQuiz] = useState(5);
  const [step, setStep] = useState(GenerateStep.GENERATE);
  const [availableQuizzes, setAvailableQuizzes] = useState<AIGeneratedQuiz[]>(
    [],
  );
  const [selectedQuizzes, setSelectedQuizzes] = useState<AIGeneratedQuiz[]>([]);
  const [alreadyGenerate, setAlreadyGenerate] = useState(false);

  const [generateQuizzes, { loading }] = useMutation<GenerateQuizzes>(
    GENERATE_QUIZZES,
    {
      onError: handleError,
    },
  );

  const onGenerate = async () => {
    const previousQuizzes = [...availableQuizzes, ...selectedQuizzes]
      .map((quiz) => {
        if ("question" in quiz && quiz.question) return quiz.question;
        if ("content" in quiz && quiz.content) return quiz.content;
        return "";
      })
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
      const quizzes = [];
      if (data.quizGenerateByAi.fillInBlankData)
        quizzes.push({
          ...data.quizGenerateByAi.fillInBlankData,
          quizType: QuizType.FILL_IN_BLANK,
        });
      if (data.quizGenerateByAi.selectOptionsData)
        quizzes.push({
          ...data.quizGenerateByAi.selectOptionsData,
          quizType: QuizType.SELECT_OPTION,
        });
      if (data.quizGenerateByAi.singleChoiceData) {
        data.quizGenerateByAi.singleChoiceData.quizzes.forEach((quiz) => {
          quizzes.push({ ...quiz, quizType: QuizType.SINGLE_CHOICE });
        });
      }
      if (data.quizGenerateByAi.multipleChoiceData) {
        data.quizGenerateByAi.multipleChoiceData.quizzes.forEach((quiz) => {
          quizzes.push({ ...quiz, quizType: QuizType.MULTIPLE_CHOICE });
        });
      }
      setAvailableQuizzes(quizzes);
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
            marginTop: 10,
          }}
        >
          <div>
            <Text size="3" weight="bold">
              <Trans>Subject</Trans>
            </Text>
            <br />
            <Text size="1" color="gray">
              <Trans>
                Subject is the main focus area that Ikigai AI can concentrate
                on. For example: Vietnam, History, General Knowledge, Grammar,
                etc. Maximum 120 characters.
              </Trans>
            </Text>
            <TextField.Root
              placeholder={t`Typing subject of quiz`}
              maxLength={120}
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
            />
          </div>
          <div>
            <Text size="3" weight="bold">
              <Trans>Details</Trans>
            </Text>
            <br />
            <Text size="1" color="gray">
              <Trans>
                You can tailor your explanation to the subject, such as using
                only German or focusing specifically on the simple present tense
                in Grammar, etc. Maximum 1000 characters (200 words)
              </Trans>
            </Text>
            <TextArea
              placeholder={t`Expand your subject`}
              value={context}
              onChange={(e) => setContext(e.currentTarget.value)}
              rows={5}
              maxLength={1000}
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
                    <Select.Item value={QuizType.FILL_IN_BLANK}>
                      <Trans>Fill In Blank</Trans>
                    </Select.Item>
                    <Select.Item value={QuizType.SELECT_OPTION}>
                      <Trans>Select Option</Trans>
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
                <Trans>Max quiz</Trans>
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
            {alreadyGenerate && (
              <Button
                variant={"outline"}
                onClick={() => setStep(GenerateStep.PICK)}
              >
                <Trans>View Generated quizzes</Trans>
              </Button>
            )}
            <Button onClick={onGenerate} loading={loading} disabled={loading}>
              <Trans>Generate</Trans>
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
