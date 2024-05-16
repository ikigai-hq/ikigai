import styled from "styled-components";
import { BreakPoints } from "styles/mediaQuery";
import { Skeleton } from "antd";

import CoverPage from "./CoverPage";
import usePageStore from "context/PageStore";
import ContentPage from "./ContentPage";

export type DocumentBodyProps = {
  loading: boolean;
};

const DocumentBody = ({ loading }: DocumentBodyProps) => {
  const activePageId = usePageStore((state) => state.activePageId);
  const page = usePageStore((state) =>
    state.pages.find((p) => p.id === state.activePageId),
  );

  return (
    <Container>
      <Body>
        {loading && <Skeleton />}
        {!loading && !activePageId && <CoverPage />}
        {!loading && activePageId && <ContentPage key={page.id} page={page} />}
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
