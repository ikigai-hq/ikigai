import { t, Trans } from "@lingui/macro";
import { Button, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { useMutation } from "@apollo/client";

import Modal from "../base/Modal";
import { GenerateQuizzes, QuizType } from "graphql/types";
import InputNumber from "../base/InputNumber";
import { GENERATE_QUIZZES } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import useSpaceStore from "store/SpaceStore";
import { ReviewGeneratedQuizzes } from "./ReviewGeneratedQuizzes";

export type QuizGeneratorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const QuizGenerator = ({ open, onOpenChange }: QuizGeneratorProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      content={<QuizGeneratorContent onClose={() => onOpenChange(false)} />}
      title={t`🪄Generate Quiz by Ikigai AI🪄`}
      description={t`
        We use AI to generate quizzes to generate quizzes.
        It can done your task in 1 minute.
      `}
      showClose={false}
    >
      <></>
    </Modal>
  );
};

export type QuizGenerateContentProps = {
  onClose: () => void;
};

const QuizGeneratorContent = ({ onClose }: QuizGenerateContentProps) => {
  const spaceId = useSpaceStore((state) => state.spaceId);
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [quizType, setQuizType] = useState(QuizType.SINGLE_CHOICE);
  const [totalQuiz, setTotalQuiz] = useState(5);

  const [generateQuizzes, { data, loading }] = useMutation<GenerateQuizzes>(
    GENERATE_QUIZZES,
    {
      onError: handleError,
    },
  );

  const onGenerate = async () => {
    await generateQuizzes({
      variables: {
        spaceId,
        quizType,
        data: {
          userContext: context,
          subject,
          totalQuizzes: totalQuiz,
        },
      },
    });
  };

  if (data) {
    return (
      <ReviewGeneratedQuizzes
        data={data.documentGenerateQuizzes.quizzes}
        onClose={onClose}
        quizType={quizType}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          resize="vertical"
          value={context}
          onChange={(e) => setContext(e.currentTarget.value)}
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
        <div style={{ flex: 1, display: "flex", gap: 5, alignItems: "center" }}>
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
        <Button variant={"soft"} color={"gray"} onClick={onClose}>
          <Trans>Close</Trans>
        </Button>
        <Button onClick={onGenerate} loading={loading} disabled={loading}>
          <Trans>Generate Quizzes</Trans>
        </Button>
      </div>
    </div>
  );
};

export default QuizGenerator;
