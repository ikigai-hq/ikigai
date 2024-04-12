import { Divider } from "antd";
import styled from "styled-components";

import { formatDate, FormatType, getNowAsSec } from "util/Time";
import useDocumentStore from "context/ZustandDocumentStore";
import { Text } from "components/common/Text";
import { Trans } from "@lingui/macro";
import { roundRealNumber } from "util/index";
import { useCorrectAnswers } from "hook/UseCorrectAnswers";

const SummarySection = () => {
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const correctAnswers = useCorrectAnswers();

  if (!activeDocument || !activeDocument.submission) return null;

  const startAt = activeDocument.submission.startAt;
  const submitAt = activeDocument.submission.submitAt || getNowAsSec();
  const doingDuration = submitAt - startAt;

  return (
    <Section>
      <Divider />
      <Text type="secondary" color={"#888E9C"}>
        <Trans>SUMMARY</Trans>
      </Text>
      {activeDocument?.submission?.allowForStudentViewAnswer && (
        <>
          <TextWrapper style={{ marginTop: "10px" }}>
            <LeftTextWrapper>
              <Text type="secondary">
                <Trans>Correct</Trans>
              </Text>
            </LeftTextWrapper>
            <RightTextWrapper>
              <Text>{correctAnswers}</Text>
            </RightTextWrapper>
          </TextWrapper>
          <TextWrapper style={{ marginTop: "10px" }}>
            <LeftTextWrapper>
              <Text type="secondary">
                <Trans>Temporary Grade</Trans>
              </Text>
            </LeftTextWrapper>
            <RightTextWrapper>
              <Text>
                {roundRealNumber(activeDocument.submission.grade) || 0.0}
              </Text>
            </RightTextWrapper>
          </TextWrapper>
        </>
      )}
      <TextWrapper>
        <LeftTextWrapper>
          <Text type="secondary">
            <Trans>Time complete</Trans>
          </Text>
        </LeftTextWrapper>
        <RightTextWrapper>
          <Text>
            {Math.ceil(doingDuration / 60)} <Trans>minutes</Trans>
          </Text>
        </RightTextWrapper>
      </TextWrapper>
      <TextWrapper>
        <LeftTextWrapper>
          <Text type="secondary">
            <Trans>Start at</Trans>
          </Text>
        </LeftTextWrapper>
        <RightTextWrapper>
          <Text>{formatDate(startAt, FormatType.DateTimeFormat)}</Text>
        </RightTextWrapper>
      </TextWrapper>
      <TextWrapper>
        <LeftTextWrapper>
          <Text type="secondary">
            <Trans>Submit at</Trans>
          </Text>
        </LeftTextWrapper>
        <RightTextWrapper>
          <Text>{formatDate(submitAt, FormatType.DateTimeFormat)}</Text>
        </RightTextWrapper>
      </TextWrapper>
    </Section>
  );
};

const TextWrapper = styled.div`
  display: flex;
`;

const LeftTextWrapper = styled.div`
  flex: 1;
`;

const RightTextWrapper = styled.div`
  flex: 1;
  text-align: right;
`;

const Section = styled.div``;

export default SummarySection;
