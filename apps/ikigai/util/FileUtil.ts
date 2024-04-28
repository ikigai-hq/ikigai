import axios from "axios";

import { CreateFileData, FileCreate, FileCreateRecording } from "graphql/types";
import { getApolloClient } from "graphql/ApolloClient";
import {
  CREATE_FILE,
  CHECK_UPLOADING_FILE,
  CREATE_FILE_RECORDING,
} from "graphql/mutation";

export type FileInfo = {
  uuid: string;
  userId: number;
  fileName: string;
  parentFolderId?: string;
  contentType: string;
  contentLength: number;
  updatedAt: number;
  createdAt: number;
  public: boolean;
  publicUrl: string | null;
};

export type UploadingInformation = {
  uploadingFile: File;
  isPublic?: boolean;
  parentFolderId?: string;
};

// FIXME: Using to avoid limitation of mb in organization.
//   Should remove in the future
export const uploadRecordingFile = async (
  uploadingInfo: UploadingInformation,
  config?: any,
): Promise<FileInfo | string> => {
  const uploadingFile = uploadingInfo.uploadingFile;

  // Create File + Upload Info
  const inputData: CreateFileData = {
    fileName: uploadingFile.name,
    contentType: uploadingFile.type,
    contentLength: uploadingFile.size,
    public: uploadingInfo.isPublic || false,
  };
  const apolloClient = getApolloClient();
  const { data, errors: createFileError } =
    await apolloClient.mutate<FileCreateRecording>({
      mutation: CREATE_FILE_RECORDING,
      variables: { data: inputData },
    });
  if (createFileError || !data) return "upload.uploaded_failed";
  const { file, uploadInfo } = data.fileCreateRecording;

  // Upload to S3
  const s3Result = await uploadS3(
    uploadInfo.uploadUrl,
    uploadInfo.fields,
    uploadingFile,
    config,
  );
  if (!s3Result) return "upload.uploaded_failed";

  // Check file
  const { errors } = await apolloClient.mutate({
    mutation: CHECK_UPLOADING_FILE,
    variables: { fileId: file.uuid },
  });
  if (errors) return "upload.uploaded_failed";

  return { ...file };
};

export const uploadFile = async (
  uploadingInfo: UploadingInformation,
  config?: any,
): Promise<FileInfo | string> => {
  const uploadingFile = uploadingInfo.uploadingFile;

  // Create File + Upload Info
  const inputData: CreateFileData = {
    fileName: uploadingFile.name,
    contentType: uploadingFile.type,
    contentLength: uploadingFile.size,
    public: uploadingInfo.isPublic || false,
  };
  const apolloClient = getApolloClient();
  const { data, errors: createFileError } =
    await apolloClient.mutate<FileCreate>({
      mutation: CREATE_FILE,
      variables: { data: inputData },
    });
  if (createFileError || !data) return "upload.uploaded_failed";
  const { file, uploadInfo } = data.fileCreate;

  // Upload to S3
  const s3Result = await uploadS3(
    uploadInfo.uploadUrl,
    uploadInfo.fields,
    uploadingFile,
    config,
  );
  if (!s3Result) return "upload.uploaded_failed";

  // Check file
  const { errors } = await apolloClient.mutate({
    mutation: CHECK_UPLOADING_FILE,
    variables: { fileId: file.uuid },
  });
  if (errors) return "upload.uploaded_failed";

  return { ...file };
};

export const uploadS3 = async (
  uploadUrl: string,
  fields: Record<string, string>,
  file: File,
  config?: any,
): Promise<boolean> => {
  const formData = new FormData();
  Object.entries(fields).map(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  const res = await axios.post(uploadUrl, formData, config);
  return res.status === 204;
};

export interface FileItem {
  fileId: string;
  fileName?: string;
  contentType: string;
  publicUrl?: string;
}
