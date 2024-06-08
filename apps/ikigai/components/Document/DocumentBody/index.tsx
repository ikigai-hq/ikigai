import styled from "styled-components";
import { Separator } from "@radix-ui/themes";

import CoverPage from "./CoverPage";
import usePageStore from "store/PageStore";
import ContentPage from "./ContentPage";
import BottomPageList from "./BottomPageList";
import Loading from "components/Loading";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";

export type DocumentBodyProps = {
  loading: boolean;
};

const DocumentBody = ({ loading }: DocumentBodyProps) => {
  const allow = usePermission();
  const activePageId = usePageStore((state) => state.activePageId);
  const page = usePageStore((state) =>
    state.pages.find((p) => p.id === state.activePageId),
  );

  return (
    <Container>
      <Body>
        <Separator style={{ width: "100%" }} />
        <BodyContent>
          {loading && <Loading />}
          {!loading && !activePageId && <CoverPage />}
          {!loading && activePageId && page && (
            <ContentPage key={page?.id} page={page} />
          )}
        </BodyContent>
        {allow(DocumentActionPermission.VIEW_PAGE_CONTENT) && (
          <BottomPageList />
        )}
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
  width: 100%;
  height: 100%;
  background: #ffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const BodyContent = styled.div`
  flex: 1;
`;

export default DocumentBody;
