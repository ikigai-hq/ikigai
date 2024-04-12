import { gql } from "@apollo/client";

export const GET_DOWNLOAD_TRANSCODING_URL = gql`
  query GetDownloadTranscodingUrl($fileId: UUID!, $documentId: UUID!) {
    fileGetDownloadTranscodingUrl(fileId: $fileId, documentId: $documentId)
  }
`;

export const GET_FULL_FILE_INFO = gql`
  query GetFullFileInfo($fileId: UUID!, $documentId: UUID!) {
    getFile(fileId: $fileId) {
      uuid
      downloadUrlByDocumentId(documentId: $documentId)
      contentType
      contentLength
      transcodingOutputKey
      transcodingOutputContentType
      transcodingOutputContentLength
    }
  }
`;

export const GET_AUDIO_WAVEFORM = gql`
  query GetAudioWaveform($fileId: UUID!, $documentId: UUID!) {
    fileWaveform(fileId: $fileId, documentId: $documentId)
  }
`;
