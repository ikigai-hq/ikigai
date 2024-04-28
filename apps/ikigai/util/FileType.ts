export const isPdf = (mimeType: string): boolean => {
  return mimeType === "application/pdf";
};

export const isImage = (mimeType: string): boolean => {
  return [
    "image/apng",
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
  ].includes(mimeType);
};

export const isOfficeFile = (mimeType: string): boolean => {
  return isPpt(mimeType) || isDoc(mimeType) || isExcel(mimeType);
};

export const isPpt = (mimeType: string): boolean => {
  return [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ].includes(mimeType);
};

export const isDoc = (mimeType: string): boolean => {
  return [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ].includes(mimeType);
};

export const isExcel = (mimeType: string): boolean => {
  return [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ].includes(mimeType);
};

export const isAudio = (mimeType: string): boolean => {
  return mimeType && mimeType.includes("audio/");
};

export const isVideo = (mimeType: string): boolean => {
  return mimeType && mimeType.includes("video/");
};

export const isFileSupport = (mimeType: string): boolean => {
  return (
    isOfficeFile(mimeType) ||
    isPpt(mimeType) ||
    isDoc(mimeType) ||
    isExcel(mimeType) ||
    isAudio(mimeType) ||
    isVideo(mimeType) ||
    isImage(mimeType) ||
    isPdf(mimeType)
  );
};
