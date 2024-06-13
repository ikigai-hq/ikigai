import { gql } from "@apollo/client";

export const CREATE_FILE = gql`
  mutation FileCreate($data: CreateFileData!) {
    fileCreate(data: $data) {
      file {
        uuid
        userId
        fileName
        contentType
        contentLength
        updatedAt
        createdAt
        public
        publicUrl
      }
      uploadInfo {
        fields
        uploadUrl
      }
    }
  }
`;

export const CHECK_UPLOADING_FILE = gql`
  mutation FileCheck($fileId: UUID!) {
    fileCheck(fileId: $fileId)
  }
`;
