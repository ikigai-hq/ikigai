import styled from "styled-components";
import { BreakPoints } from "styles/mediaQuery";

import CoverPage from "./CoverPage";
import { useRef, useState } from "react";
import { Skeleton } from "antd";
import TiptapEditor from "./Editor";

export type DocumentBodyProps = {
  loading: boolean;
};

const DocumentBody = ({ loading }: DocumentBodyProps) => {
  const [activePageId] = useState<string | undefined>();
  const documentBodyRef = useRef<HTMLDivElement>(null);

  return (
    <Container ref={documentBodyRef}>
      <Body>
        {loading && <Skeleton />}
        {!loading && !activePageId && <CoverPage />}
        <TiptapEditor parentRef={documentBodyRef} />
      </Body>
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 100%;
  position: relative;
  height: 100%;
`;

const Body = styled.div<{
  $isViewInMobile?: boolean;
}>`
  overflow: auto;
  width: 100%;
  height: 100%;
  border-radius: ${(props) => (props.$isViewInMobile ? 0 : 8)}px;
  border-top: ${(props) => `1px solid ${props.theme.colors.gray[3]}`};
  background: #ffff;
  border: 1px solid var(--gray-4, #eaecef);
  box-sizing: border-box;

  ${BreakPoints.tablet} {
    margin: 0;
    max-height: 100%;
    height: 100%;
    border: none;
  }
`;

export default DocumentBody;
