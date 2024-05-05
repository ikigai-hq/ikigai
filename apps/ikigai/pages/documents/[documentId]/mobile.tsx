import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  ListQuestion,
  QuestionNumber,
} from "components/Document/RightPanel/SubmissionPanel";
import { DocumentType, getDocumentType } from "../../../util/DocumentHelper";
import { Container } from "components/Document/common";
import ServerDocumentFetchError from "components/Document/ServerDocumentFetchError";
import useQuizStore from "context/ZustandQuizStore";
import usePageBlockStore from "context/ZustandPageBlockStore";
import { PresentationMode } from "components/common/RichMarkdownEditor/PresentationMode";
import { useLoadDocument } from "hook/UseLoadDocument";
import useDocumentStore from "context/ZustandDocumentStore";
import Loading from "components/Loading";

export default function DocumentMobile() {
  const router = useRouter();
  const {
    query: { documentId },
  } = router;
  const { error } = useLoadDocument(documentId as string);
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const fetchError = useDocumentStore((state) => state.fetchError);
  const quizzes = useQuizStore((state) =>
    state.mapQuizBlockData.get(masterDocument?.id),
  );
  const mapPageBlockData = usePageBlockStore((state) => state.mapPageBlockData);

  const documentType = getDocumentType(masterDocument);
  const hasQuizzes =
    quizzes?.length > 0 &&
    [DocumentType.Assignment, DocumentType.Submission].includes(documentType);
  const isPresentationMode = mapPageBlockData.get(masterDocument?.id)?.length;

  const scrollToQuiz = (quizId: string) => {
    const element = document.getElementById(quizId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  if (fetchError || error) {
    return (
      <ServerDocumentFetchError
        fetchError={fetchError}
        showBackToHome={false}
      />
    );
  }

  if (!masterDocument) return <Loading />;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        overscrollBehavior: "none",
      }}
    >
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      {hasQuizzes && !isPresentationMode && (
        <QuestionsContainer>
          <ListQuestion>
            {quizzes?.map((quiz, index) => (
              <QuestionNumber
                key={quiz.id}
                quizNumber={index + 1}
                quizId={quiz.id}
                onClickQuiz={() => scrollToQuiz(quiz.id)}
              />
            ))}
          </ListQuestion>
        </QuestionsContainer>
      )}
      <Container>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "auto",
          }}
        >
          <PresentationMode
            isViewInMobileApp
            currentDocument={masterDocument}
          />
        </div>
      </Container>
    </div>
  );
}

const QuestionsContainer = styled.div`
  width: calc(100% - 32);
  padding: 8px 16px 12px;
  top: 0px;
  z-index: 2;
  background: ${(props) => props.theme.colors.gray[0]};
  overflow-x: auto;
  overflow-y: hidden;
`;
