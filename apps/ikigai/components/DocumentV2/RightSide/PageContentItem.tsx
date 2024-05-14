import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { useRef, useState } from "react";
import { ClickEvent, ControlledMenu, MenuItem } from "@szhsin/react-menu";
import { useClickAway } from "ahooks";

import usePageStore, { IPage } from "context/PageStore";
import { RemovePage } from "graphql/types";
import { REMOVE_PAGE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import { Trans } from "@lingui/macro";
import { Typography } from "antd";

export type PageContentItemProps = {
  index: number;
  page?: IPage;
};

const PageContentItem = ({ page, index }: PageContentItemProps) => {
  const [isOpenContextMenu, setOpenContextMenu] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const activePageId = usePageStore((state) => state.activePageId);
  const pages = usePageStore((state) => state.pages);
  const setActivePageId = usePageStore((state) => state.setActivePageId);
  const removePageInStore = usePageStore((state) => state.removePage);

  const [removePage] = useMutation<RemovePage>(REMOVE_PAGE, {
    onError: handleError,
  });

  const onClickRemove = async (e: ClickEvent) => {
    e.syntheticEvent.stopPropagation();
    const { data } = await removePage({ variables: { pageId: page.id } });

    if (data) {
      removePageInStore(page.id);
      if (activePageId === page.id) {
        setActivePageId(undefined);
      }
    }
  };

  const onClickSetActivePageId = () => {
    const findingPage = pages.find((p) => page?.id === p.id);
    if (findingPage) setActivePageId(page.id);
  };

  if (!page) {
    // It's cover page
    return (
      <PageContainer onClick={() => setActivePageId(undefined)}>
        <PageIndexContainer $active={!activePageId}>1</PageIndexContainer>
        <PagePreview $active={!activePageId} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      key={page.id}
      onClick={onClickSetActivePageId}
      onContextMenu={(e) => {
        if (typeof document.hasFocus === "function" && !document.hasFocus())
          return;

        e.preventDefault();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        setOpenContextMenu(true);
      }}
    >
      <PageControlledMenu
        isOpen={isOpenContextMenu}
        setOpen={setOpenContextMenu}
        anchorPoint={anchorPoint}
        onClickRemove={onClickRemove}
      />
      <PageIndexContainer $active={activePageId === page.id}>
        {index}
      </PageIndexContainer>
      <PagePreview $active={activePageId === page.id} />
    </PageContainer>
  );
};

type PageContentControlledMenuProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  anchorPoint: {
    x: number;
    y: number;
  };
  onClickRemove?: (e: ClickEvent) => Promise<void>;
};

const PageControlledMenu = ({
  isOpen,
  setOpen,
  anchorPoint,
  onClickRemove,
}: PageContentControlledMenuProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  useClickAway(
    () => {
      setOpen(false);
    },
    ref,
    ["click"],
  );

  return (
    <ControlledMenu
      anchorPoint={anchorPoint}
      state={isOpen ? "open" : "closed"}
      direction="right"
      ref={ref}
    >
      <MenuItem onClick={onClickRemove}>
        <Typography.Text type="danger">
          <Trans>Delete</Trans>
        </Typography.Text>
      </MenuItem>
    </ControlledMenu>
  );
};

const PageIndexContainer = styled.div<{ $active?: boolean }>`
  width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${(props) =>
    props.$active ? props.theme.colors.primary[5] : "black"};
`;

const PagePreview = styled.div<{ $active?: boolean }>`
  flex: 1;
  border-radius: 8px;
  height: 90px;
  background: ${(props) => props.theme.colors.primary[3]};
  border: 2px solid
    ${(props) => (props.$active ? props.theme.colors.primary[5] : "white")};
`;

const PageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  margin-top: 10px;
`;

export default PageContentItem;
