import { gql } from "@apollo/client";

export const SOFT_DELETE_DOCUMENT = gql`
  mutation SoftDeleteDocument($documentId: UUID!, $includeChildren: Boolean!) {
    documentSoftDelete(
      documentId: $documentId
      includeChildren: $includeChildren
    )
  }
`;

export const ADD_DOCUMENT_STANDALONE = gql`
  mutation AddDocumentStandalone(
    $data: NewDocument!
    $spaceId: Int
    $isAssignment: Boolean!
  ) {
    documentCreate(
      data: $data
      spaceId: $spaceId
      isAssignment: $isAssignment
    ) {
      id
      title
      createdAt
      parentId
      index
      documentType
      deletedAt
      iconType
      iconValue
      tags {
        tag
      }
      assignment {
        id
        submissions {
          id
          userId
          finalGrade
          grade
          attemptNumber
          documentId
        }
      }
      submission {
        id
      }
      visibility
    }
  }
`;

export const UPDATE_DOCUMENT_POSITIONS = gql`
  mutation UpdateDocumentPositions($items: [UpdatePositionData!]!) {
    documentUpdatePositions(items: $items)
  }
`;

export const ADD_OR_UPDATE_PAGE = gql`
  mutation AddOrUpdatePage($page: PageInput!, $isSinglePage: Boolean) {
    documentAddOrUpdatePage(page: $page, isSinglePage: $isSinglePage) {
      id
      documentId
      index
      title
      layout
      pageContents {
        id
        pageId
        index
        body
        updatedAt
        createdAt
      }
    }
  }
`;

export const REMOVE_PAGE = gql`
  mutation RemovePage($pageId: UUID!) {
    documentRemovePage(pageId: $pageId)
  }
`;

export const ADD_ORG_UPDATE_PAGE_CONTENT = gql`
  mutation AddOrUpdatePageContent($pageContent: PageContentInput!) {
    documentAddOrUpdatePageContent(pageContent: $pageContent) {
      id
      pageId
      index
      body
      updatedAt
      createdAt
    }
  }
`;

export const ASSIGN_TO_STUDENTS = gql`
  mutation AssignDocument($documentId: UUID!, $emails: [String!]!) {
    documentAssign(documentId: $documentId, emails: $emails)
  }
`;

export const REMOVE_ASSIGNEE = gql`
  mutation RemoveDocumentAssignee($documentId: UUID!, $userId: Int!) {
    documentRemoveAssignee(documentId: $documentId, userId: $userId)
  }
`;

export const GENERATE_QUIZZES = gql`
  mutation GenerateQuizzes(
    $quizType: QuizType!
    $data: GenerateQuizzesRequestData!
  ) {
    quizGenerateByAi(quizType: $quizType, data: $data) {
      quizType
      singleChoiceData {
        subject
        quizzes {
          question
          answers
          correctAnswer
        }
      }
      multipleChoiceData {
        subject
        quizzes {
          question
          answers
          correctAnswers
        }
      }
      fillInBlankData {
        content
        quizzes {
          position
          correctAnswer
        }
      }
      selectOptionsData {
        content
        quizzes {
          position
          answers
          correctAnswer
        }
      }
    }
  }
`;

export const ADD_DOCUMENT_TAG = gql`
  mutation AddDocumentTag($tag: DocumentTagInput!) {
    documentAddTag(tag: $tag) {
      tag
    }
  }
`;

export const REMOVE_DOCUMENT_TAG = gql`
  mutation RemoveDocumentTag($tag: DocumentTagInput!) {
    documentRemoveTag(tag: $tag)
  }
`;

export const UPSERT_DOCUMENT_EMBED = gql`
  mutation UpsertDocumentEmbedSession($session: EmbeddedSessionInput!) {
    documentUpsertEmbeddedSession(session: $session) {
      sessionId
      documentId
      isActive
    }
  }
`;
