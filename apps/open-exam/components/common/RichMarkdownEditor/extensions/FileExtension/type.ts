export type FileNodeAttrs = {
  files: FileAttrs[];
  fileId?: string;
  name?: string;
  size?: Size;
  audioSubmissionReplay?: boolean;
};

export type FileAttrs = {
  fileId?: string;
  name?: string;
  contentType?: string;
  publicUrl?: string;
  createdAt?: number;
  downloadable?: boolean;
};

export type Size = { width: number; height: number };
