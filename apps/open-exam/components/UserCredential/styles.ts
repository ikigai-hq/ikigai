import { Form } from "antd";
import styled from "styled-components";
import { BreakPoints } from "styles/mediaQuery";

export const WelcomeTitle = styled.div`
  margin-bottom: 24px;

  ${BreakPoints.mobile} {
    span[level="7"] {
      font-size: 34px;
    }
  }
`;

export const FormAuthContainer = styled.div`
  width: 556px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
  padding: 64px 64px 16px 64px;
  margin-top: 52px;
  margin-bottom: 48px;
  background: ${(props) => props.theme.colors.gray[0]};
  ${BreakPoints.tablet} {
    margin-top: 52px;
    margin-bottom: 48px;
  }

  ${BreakPoints.mobile} {
    width: 100%;
  }
`;

export const PreviousStep = styled.div`
  cursor: pointer;
  border: ${(props) => `2px solid ${props.theme.colors.gray[8]}`};
  display: flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  border-radius: 2px;
`;

export const SubmitButton = styled(Form.Item)`
  margin-top: 28px;
`;
