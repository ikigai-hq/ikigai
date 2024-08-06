import styled from "styled-components";

export const LeftSideContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
`;

export const LeftSideHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 10px;
  padding-right: 10px;
`;

export const LeftSideContentWrapper = styled.div`
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  padding: 5px;
`;
