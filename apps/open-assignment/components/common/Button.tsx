import {
  Button as ButtonAntd,
  Tooltip,
  ButtonProps as AntdBtnProps,
  TooltipProps,
} from "antd";
import styled from "styled-components";

type ButtonProps = {
  customWidth?: string;
  margin?: string;
};

export const Button = styled(ButtonAntd)<ButtonProps>`
  & {
    width: ${({ customWidth = "max-content" }: ButtonProps) =>
      `${customWidth}`};
    height: auto;
    padding: 11px 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const ButtonWithTooltip: React.FC<{
  btnProps: AntdBtnProps;
  tooltipProps: TooltipProps;
  btnChildren?: React.ReactNode;
  isSelected?: boolean;
}> = ({ btnProps, tooltipProps, btnChildren, isSelected }) => {
  return (
    <Tooltip {...tooltipProps} destroyTooltipOnHide arrow={false}>
      <SelectedButton
        $isSelected={isSelected}
        onClick={btnProps.onClick}
        {...btnProps}
      >
        {btnChildren}
      </SelectedButton>
    </Tooltip>
  );
};

const SelectedButton = styled(ButtonAntd)<{ $isSelected?: boolean }>`
  &&& {
    background: ${({ $isSelected, theme }) => {
      return $isSelected ? `${theme.colors.primary[1]} !important` : undefined;
    }};

    &:hover {
      background: ${(props) => props.theme.colors.primary[1]};

      svg {
        color: ${(props) => props.theme.colors.primary[7]};
      }
    }

    ${(props) =>
      props.$isSelected &&
      `
      svg {
        color: ${props.theme.colors.primary[7]}
      }
    `}
  }
`;

export const TextButton = styled(Button)`
  padding: 0px;
  text-align: left;
  margin: ${({ margin }: ButtonProps) => `${margin}`};

  &:hover {
    background: transparent;
  }
`;

export const TextButtonWithHover = styled(TextButton)<{
  $isSelected?: boolean;
}>`
  padding: 2px;
  margin-left: 5px;
  margin-right: 5px;
  background: ${(props) => {
    return props.$isSelected
      ? `${props.theme.colors.gray[4]} !important`
      : undefined;
  }};

  &: hover
    ${() => {
      return `background: ${(props) => props.theme.colors.gray[4]}`;
    }};
`;

export const TextButtonBlock = styled(TextButtonWithHover)<{ margin?: string }>`
  padding: 4px;

  ${(props) => props.margin && `margin: ${props.margin}`};
`;
