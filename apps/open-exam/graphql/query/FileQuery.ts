import { gql } from "@apollo/client";

export const GET_FULL_FILE_INFO = gql`
  query GetFullFileInfo($fileId: UUID!, $documentId: UUID!) {
    getFile(fileId: $fileId) {
      uuid
      downloadUrlByDocumentId(documentId: $documentId)
      contentType
      contentLength
    }
  }
`;

export const GET_AUDIO_WAVEFORM = gql`
  query GetAudioWaveform($fileId: UUID!, $documentId: UUID!) {
    fileWaveform(fileId: $fileId, documentId: $documentId)
  }
`;
