import React, { ChangeEvent, CSSProperties } from "react";
import { v4 } from "uuid";

import { FileResponse, uploadFile } from "util/FileUtil";

export type FileUploaderProps = {
  children: React.ReactNode;
  isPublic?: boolean;
  style?: CSSProperties;
  accept?: string;
  multiple?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: (file: FileResponse) => void;
  onError?: (message: string) => void;
};

const FileUploader = ({
  children,
  style,
  accept,
  multiple,
  isPublic,
  onError,
  onComplete,
  onProgress,
}: FileUploaderProps) => {
  const onSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files) {
      for (const file of files) {
        await uploadAFile(file);
      }
    }
  };

  const uploadAFile = async (file: File) => {
    if (onProgress) onProgress(0);
    const res = await uploadFile({
      uploadingFile: file,
      isPublic,
    });

    if (typeof res === "string") {
      if (onError) onError(res);
    } else {
      if (onProgress) onProgress(100);
      onComplete(res);
    }
  };

  const id = v4();
  return (
    <>
      <label htmlFor={id} style={style}>
        {children}
      </label>
      <input
        multiple={multiple}
        style={{ display: "none" }}
        id={id}
        name={id}
        type={"file"}
        accept={accept}
        onInput={onSelect}
      />
    </>
  );
};

export default FileUploader;
