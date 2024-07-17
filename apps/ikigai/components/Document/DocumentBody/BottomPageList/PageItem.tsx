import { IconButton, Text, TextField } from "@radix-ui/themes";
import styled from "styled-components";
import { t, Trans } from "@lingui/macro";
import { useState } from "react";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";

import usePageStore, { IPage } from "store/PageStore";
import Modal from "components/base/Modal";
import useUpdatePage from "hook/UseUpdatePage";
import AlertDialog from "components/base/AlertDialog";
import { REMOVE_PAGE } from "graphql/mutation/DocumentMutation";
import { handleError } from "graphql/ApolloClient";
import usePermission from "hook/UsePermission";
import { DocumentActionPermission } from "graphql/types";
import { usePageOrderedQuizzes } from "hook/UseQuiz";
import QuizzesList from "./QuizzesList";

export type PageItemProps = {
  page?: IPage;
  index?: number;
};

const PageItem = ({ page, index }: PageItemProps) => {
  const allow = usePermission();
  const activePageId = usePageStore((state) => state.activePageId);
  const setActivePageId = usePageStore((state) => state.setActivePageId);
  const removePageInStore = usePageStore((state) => state.removePage);
  const activePage = usePageStore((state) =>
    state.pages.find((page) => page.id === activePageId),
  );
  const { pageOrderedQuizzes } = usePageOrderedQuizzes(page?.id);
  const { upsert } = useUpdatePage(activePageId);
  const [innerTitle, setInnerTitle] = useState(activePage?.title);
  const [deletePage] = useMutation(REMOVE_PAGE, {
    onError: handleError,
  });

  const onSave = () => {
    upsert({ title: innerTitle });
  };

  const onDelete = async () => {
    const { data } = await deletePage({
      variables: {
        pageId: activePageId,
      },
    });
    if (data) {
      removePageInStore(activePageId);
      setActivePageId(undefined);
      toast.success(t`Deleted!`);
    }
  };

  const answeredQuiz = pageOrderedQuizzes.filter(
    ({ answer }) => !!answer,
  ).length;
  const isActive = activePageId === page?.id;
  const isExpanded = isActive && !!page;
  console.log("Hello", answeredQuiz, page?.id, pageOrderedQuizzes);
  return (
    <div style={{ display: "flex" }}>
      <PageContainer
        onClick={() => setActivePageId(page?.id)}
        $active={isActive}
        $isExpanded={!!page}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flex: 1,
            gap: 4,
          }}
        >
          {!page && (
            <Text weight="medium">
              <Trans>Information</Trans>
            </Text>
          )}
          {index && !isExpanded && (
            <Text weight="medium" truncate>
              {page?.title}{" "}
              <Text size="1" color="gray">
                <Trans>
                  {answeredQuiz} of {pageOrderedQuizzes.length} quizzes
                </Trans>
              </Text>
            </Text>
          )}
          {isExpanded && (
            <QuizzesList
              orderedQuizzes={pageOrderedQuizzes}
              hasEditTool={
                isExpanded && allow(DocumentActionPermission.MANAGE_DOCUMENT)
              }
            />
          )}
        </div>
        {isExpanded && allow(DocumentActionPermission.MANAGE_DOCUMENT) && (
          <>
            <Modal
              title={t`Edit Page`}
              content={
                <div>
                  <Text weight="bold">
                    <Trans>Name</Trans>
                  </Text>
                  <TextField.Root
                    placeholder={t`Type page name`}
                    defaultValue={page?.title}
                    onChange={(e) => setInnerTitle(e.currentTarget.value)}
                  />
                </div>
              }
              onOk={onSave}
            >
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                style={{ marginRight: 3 }}
              >
                <Pencil1Icon />
              </IconButton>
            </Modal>
            <AlertDialog
              title={t`Delete page ${innerTitle}!`}
              description={t`This action cannot revert, do you want to delete this page?`}
              onConfirm={onDelete}
            >
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                style={{ marginRight: 3 }}
              >
                <TrashIcon />
              </IconButton>
            </AlertDialog>
          </>
        )}
      </PageContainer>
    </div>
  );
};

const PageContainer = styled.div<{
  $active?: boolean;
  $isExpanded?: boolean;
}>`
  width: ${(props) => (props.$isExpanded ? "400px" : "130px")};
  cursor: pointer;
  background-color: ${(props) =>
    props.$active ? "var(--indigo-4)" : "var(--gray-1)"};
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all linear 0.4s;
  padding: 5px;
  justify-content: center;
`;

export default PageItem;
