import styled from "styled-components";
import { BreakPoints } from "styles/mediaQuery";

export const RecordBlockContainer = styled.div`
  margin: 10px 0;
  width: 100%;
  display: flex;
  align-items: center;

  video {
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
    transform: scaleX(-1);
  }
`;

export const RecordBlockBody = styled.div`
  height: fit-content;
  text-align: center;
  width: 100%;
  max-width: 420px;

  ${BreakPoints.tablet} {
    max-width: 100%;
  }
`;

export const RecordBox = styled.div<{ isStart?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.isStart ? "12px" : "8px")};
  padding: ${(props) =>
    props.isStart ? "8px 20px 8px 8px" : "5px 16px 5px 8px"};
  cursor: pointer;
  background: ${(props) => (props.isStart ? "#fff" : "#F5F6F9")};
  box-shadow: ${(props) =>
    props.isStart ? "0px 0px 20px rgba(19, 48, 122, 0.1)" : "unset"};
  border-radius: 35.5px;
  height: 50px;
  box-sizing: border-box;
  width: ${(props) => (props.isStart ? "max-content" : "100%")};

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const TogglePlay = styled.div<{ size?: number; isDenied?: boolean }>`
  min-width: ${(props) => `${props.size || 32}px`};
  width: ${(props) => `${props.size || 32}px`};
  height: ${(props) => `${props.size || 32}px`};
  background: ${(props) =>
    props.isDenied ? props.theme.colors.red[5] : props.theme.colors.blue[5]};
  border-radius: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;

  position: relative;

  ${(props) =>
    props.isDenied &&
    `
      &::before {
        content: '';
        position: absolute;
        width: 20px;
        height: 1px;
        background: #fff;
        transform: rotate(-45deg);
      }
    `}
`;

export const RecordingBox = styled.div<{ type?: string }>`
  background: #f5f6f9;
  border-radius: 12px;
  padding: ${(props) =>
    props.type === "video" ? "28px 28px 20px 28px" : "24px 16px 17px 16px"};
  width: ${(props) => (props.type === "video" ? "864px" : "100%")};
  margin: auto;
  overflow: hidden;

  video {
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
  }
`;

export const GroupOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  button {
    padding: 0;
  }
`;
