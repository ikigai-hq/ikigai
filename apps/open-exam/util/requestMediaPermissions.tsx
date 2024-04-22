import Bowser from "bowser";

export type MediaPermissionsError = {
  type?: MediaPermissionsErrorType;
  name: string;
  message?: string;
};

export enum MediaPermissionsErrorType {
  PermissionDenied = "PermissionDenied",
  CouldNotStartVideoSource = "CouldNotStartVideoSource",
  DISMISSED = "Dismissed",
}

export const requestMediaPermissions = (
  constraints?: MediaStreamConstraints,
): Promise<MediaStream> => {
  const browser = Bowser.getParser(window.navigator.userAgent);
  const browserName = browser.getBrowserName();
  return new Promise<MediaStream>((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia(constraints ?? { audio: true, video: true })
      .then((stream: MediaStream) => {
        resolve(stream);
      })
      .catch((err: any) => {
        const errName = err.name;
        const errMessage = err.message;
        let errorType: MediaPermissionsErrorType =
          MediaPermissionsErrorType.CouldNotStartVideoSource;
        if (errName === "NotAllowedError") {
          if (
            errMessage === "Permission denied" ||
            (browserName !== "Chrome" && browserName !== "Microsoft Edge")
          ) {
            errorType = MediaPermissionsErrorType.PermissionDenied;
          } else {
            errorType = MediaPermissionsErrorType.DISMISSED;
          }
        }

        reject({
          type: errorType,
          name: errName,
          message: errMessage,
        });
      });
  });
};
