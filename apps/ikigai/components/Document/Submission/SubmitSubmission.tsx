import React from "react";
import styled from "styled-components";
import { Statistic } from "antd";
import { Button } from "components/common/Button";
import { Text } from "components/common/Text";
import { useTheme } from "styled-components";
import { ClockCircleFilled } from "@ant-design/icons";
import { SendIcon } from "components/common/IconSvg";
import { DesktopOnly } from "styles/styledCommon";

const { Countdown } = Statistic;
export type SubmissionDocumentProps = {
  deadline: number;
  onSubmit: () => Promise<void>;
};

const SubmitSubmission = ({ deadline, onSubmit }: SubmissionDocumentProps) => {
  const theme = useTheme();

  return (
    <SubmitSubmissionContainer>
      <Button
        type="primary"
        style={{ padding: "8px 12px", gap: 8 }}
        onClick={onSubmit}
      >
        {deadline ? (
          <Wrapper>
            <Wrapper>
              <DesktopOnly>
                <ClockCircleFilled />
              </DesktopOnly>
              <Countdown
                value={deadline}
                valueStyle={{
                  fontSize: 16,
                  color: theme.colors.gray[0],
                  lineHeight: "24px",
                }}
              />
            </Wrapper>
            <Text
              level={3}
              color={theme.colors.gray[0]}
              style={{ position: "relative", bottom: 1 }}
            >
              /
            </Text>
          </Wrapper>
        ) : null}
        <Wrapper>
          <Text level={3} color={theme.colors.gray[0]}>
            Submit
          </Text>
          {deadline ? (
            <DesktopOnly>
              <SendIcon
                style={{
                  width: 18,
                  color: theme.colors.gray[0],
                }}
              />
            </DesktopOnly>
          ) : (
            <SendIcon
              style={{
                width: 18,
                color: theme.colors.gray[0],
              }}
            />
          )}
        </Wrapper>
      </Button>
    </SubmitSubmissionContainer>
  );
};

const SubmitSubmissionContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  color: #fff;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default SubmitSubmission;
