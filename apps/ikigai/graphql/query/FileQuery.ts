import { gql } from "@apollo/client";

export const GET_FILE = gql`
  query GetFile($fileId: UUID!) {
    getFile(fileId: $fileId) {
      uuid
      contentType
      contentLength
      fileName
    }
  }
`;

export const GET_DOWNLOAD_URL_BY_PAGE_CONTENT_ID = gql`
  query GetDownloadUrl($fileId: UUID!, $pageContentId: UUID!) {
    getFile(fileId: $fileId) {
      uuid
      downloadUrlByPageContentId(pageContentId: $pageContentId)
    }
  }
`;

export const GET_AUDIO_WAVEFORM = gql`
  query GetAudioWaveform($fileId: UUID!, $documentId: UUID!) {
    fileWaveform(fileId: $fileId, documentId: $documentId)
  }
`;
