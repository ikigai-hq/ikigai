import { Card, Text } from "@radix-ui/themes";
import styled from "styled-components";
import { Trans } from "@lingui/macro";

import usePageStore, { IPage } from "store/PageStore";

export type PageItemProps = {
  page?: IPage;
  index?: number;
};

const PageItem = ({ page, index }: PageItemProps) => {
  const activePageId = usePageStore((state) => state.activePageId);
  const setActivePageId = usePageStore((state) => state.setActivePageId);

  const isActive = activePageId === page?.id;
  const isExpanded = isActive && !!page;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PageContainer
        size="1"
        onClick={() => setActivePageId(page?.id)}
        $active={isActive}
        $isExpanded={isExpanded}
      >
        <div>
          {!page && (
            <Text weight="medium">
              <Trans>Main</Trans>
            </Text>
          )}
          {index && (
            <Text weight="medium" truncate>
              {page?.title}
            </Text>
          )}
        </div>
      </PageContainer>
      {index && (
        <div style={{ textAlign: "center" }}>
          <Text size="1" color="gray">
            {index}
          </Text>
        </div>
      )}
    </div>
  );
};

const PageContainer = styled(Card)<{
  $active?: boolean;
  $isExpanded?: boolean;
}>`
  height: 42px;
  width: ${(props) => (props.$isExpanded ? "400px" : "130px")};
  cursor: pointer;
  background-color: ${(props) => (props.$active ? "#0588F0" : "unset")};
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all linear 0.3s;
  padding: 5px;
  justify-content: center;

  &:hover {
    background-color: #c2e5ff;
  }
`;

export default PageItem;
