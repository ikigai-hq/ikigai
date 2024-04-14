import { gql } from "@apollo/client";


export const DOCUMENT_UPDATE_PUBLIC = gql`
  mutation DocumentUpdatePublic($documentId: UUID!, $isPublic: Boolean!) {
    documentUpdatePublic(documentId: $documentId, isPublic: $isPublic)
  }
`;

export const SOFT_DELETE_DOCUMENTS = gql`
  mutation SoftDeleteDocuments($documentIds: [UUID!]!, $spaceId: Int!) {
    spaceSoftDeleteMultiple(spaceId: $spaceId, documentIds: $documentIds)
  }
`;

export const ADD_DOCUMENT_STANDALONE = gql`
  mutation AddDocumentStandalone($data: NewDocument!, $spaceId: Int, $isAssignment: Boolean!) {
    documentCreate(data: $data, spaceId: $spaceId, isAssignment: $isAssignment) {
      id
    }
  }
`;

export const UPDATE_DOCUMENT_POSITIONS = gql`
  mutation UpdateDocumentPositions($items: [UpdatePositionData!]!) {
    documentUpdatePositions(items: $items)
  }
`;


export const DOCUMENT_UPDATE_HIDE_RULE = gql`
  mutation DocumentUpdateHideRule($documentId: UUID!, $hideRule: HideRule!) {
    documentUpdateHideRule(documentId: $documentId, hideRule: $hideRule)
  }
`;

// NOTE: using this to update PageBLock title.
export const DOCUMENT_ADD_PAGE_BLOCK = gql`
  mutation DocumentAddPageBlock($data: PageBlockInput!) {
    documentAddPageBlock(data: $data) {
      id
      documentId
      title
    }
  }
`;

export const DOCUMENT_ADD_PAGE_BLOCK_DOCUMENT = gql`
  mutation DocumentAddPageBlockDocument($data: PageBlockDocumentInput!) {
    documentAddPageBlockDocument(data: $data) {
      pageBlockId
      documentId
      index
      createdAt
      document {
        id
        body
      }
    }
  }
`;

export const DOCUMENT_CLONE_PAGE_BLOCK = gql`
  mutation documentClonePageBlock(
    $fromId: UUID!
    $toId: UUID!
    $toDocumentId: UUID!
  ) {
    documentClonePageBlock(
      fromId: $fromId
      toId: $toId
      toDocumentId: $toDocumentId
    ) {
      id
      documentId
      title
      nestedDocuments {
        pageBlockId
        documentId
        index
        createdAt
        document {
          id
          body
        }
      }
    }
  }
`;

export const RESTORE_DOCUMENT = gql`
  mutation RestoreDocument($documentId: UUID!) {
    documentRestore(documentId: $documentId)
  }
`;

export const DELETE_DOCUMENT_PERMANENT = gql`
  mutation DeleteDocumentPermanent($documentId: UUID!) {
    documentDelete(documentId: $documentId)
  }
`;

export const APPLY_DOCUMENT_TEMPLATE = gql`
  mutation ApplyDocumentTemplate(
    $originalDocumentId: UUID!
    $templateId: UUID!
  ) {
    documentApplyTemplate(
      originalDocumentId: $originalDocumentId
      templateId: $templateId
    ) {
      id
    }
  }
`;

export const SAVE_AS_DOCUMENT_TEMPLATE = gql`
  mutation SaveAsDocumentTemplate($documentId: UUID!) {
    orgAddTemplate(documentId: $documentId) {
      id
    }
  }
`;

export const ADD_DOCUMENT_TEMPLATE_CATEGORY = gql`
  mutation AddDocumentTemplateCategory($category: String!) {
    orgAddTemplateCategory(category: $category) {
      id
      name
      orgId
      orgInternalIndex
      isCommunity
      communityIndex
      tags {
        tag
      }
    }
  }
`;

export const UPDATE_DOCUMENT_TEMPLATE = gql`
  mutation UpdateDocumentTemplate($template: DocumentTemplateInput!) {
    orgUpdateTemplate(template: $template) {
      id
    }
  }
`;

export const ADD_DOCUMENT_TEMPLATE_TAG = gql`
  mutation AddDocumentTemplateTag($templateTag: DocumentTemplateTagInput!) {
    orgAddTemplateTag(templateTag: $templateTag) {
      tag
    }
  }
`;

export const DELETE_DOCUMENT_TEMPLATE_TAG = gql`
  mutation RemoveDocumentTemplateTag($templateTag: DocumentTemplateTagInput!) {
    orgDeleteTemplateTag(templateTag: $templateTag)
  }
`;

export const UPDATE_DOCUMENT_CATEGORY_TEMPLATE = gql`
  mutation UpdateDocumentCategoryTemplate($category: CategoryInput!) {
    orgUpdateTemplateCategory(category: $category) {
      id
    }
  }
`;

export const ADD_DOCUMENT_CATEGORY_TAG = gql`
  mutation AddDocumentCategoryTag($categoryTag: CategoryTagInput!) {
    orgAddCategoryTag(categoryTag: $categoryTag) {
      tag
    }
  }
`;

export const DELETE_DOCUMENT_CATEGORY_TAG = gql`
  mutation DeleteDocumentCategoryTag($categoryTag: CategoryTagInput!) {
    orgDeleteCategoryTag(categoryTag: $categoryTag)
  }
`;

export const DELETE_DOCUMENT_TEMPLATE = gql`
  mutation DeleteDocumentTemplate($templateId: UUID!) {
    orgDeleteDocumentTemplate(templateId: $templateId)
  }
`;

export const DELETE_DOCUMENT_TEMPLATE_CATEGORY = gql`
  mutation DeleteDocumentTemplateCategory($categoryId: UUID!) {
    orgDeleteCategory(categoryId: $categoryId)
  }
`;

export const CREATE_DOCUMENT_VERSION = gql`
  mutation CreateDocumentVersion($name: String!, $documentId: UUID!) {
    documentCreateVersion(name: $name, documentId: $documentId) {
      id
      rootDocumentId
      versioningDocumentId
      name
    }
  }
`;

export const RESTORE_DOCUMENT_VERSION = gql`
  mutation RestoreDocumentVersion($versionId: UUID!) {
    documentApplyHistoryVersion(versionId: $versionId) {
      id
    }
  }
`;

export const UPDATE_DOCUMENT_VERSION = gql`
  mutation UpdateDocumentVersion($data: DocumentVersionInput!) {
    documentUpdateVersion(data: $data) {
      id
    }
  }
`;
