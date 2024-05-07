import React from "react";
import styled from "styled-components";

import { BreakPoints } from "styles/mediaQuery";

const RightSide = () => {
  return (
    <Container $hide={false}>
      <div style={{ width: "100%" }}>
        <SpaceInfoContainer>
          Right Side
        </SpaceInfoContainer>
      </div>
    </Container>
  );
};

export default RightSide;

const SpaceInfoContainer = styled.div`
  padding: 5px;
`;

const Container = styled.div<{
  $hide: boolean;
}>`
  min-width: 250px;
  width: 250px;
  display: ${({ $hide }) => ($hide ? "none" : "flex")};
  border-radius: 8px;
  backdrop-filter: blur(12px);
  border: ${({ $hide }) =>
    $hide ? "none" : "1px solid var(--gray-4, #EAECEF)"};
  background: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
  height: 100%;

  ${BreakPoints.tablet} {
    box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
    width: 100%;
    height: auto;
  }
`;
