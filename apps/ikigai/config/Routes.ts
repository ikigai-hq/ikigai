export enum Routes {
  Home = "/",
  DocumentDetail = "/documents/:documentId",
  PreJoinSpace = "/spaces/:spaceId/join/:token",
  EmptySpace = "/spaces/:spaceId/start",
  NotFound = "/404",
}

export const formatStartSpace = (spaceId: number) => {
  return Routes.EmptySpace.replace(":spaceId", spaceId.toString());
};

export const formatDocumentRoute = (documentId: string) => {
  return Routes.DocumentDetail.replace(":documentId", documentId);
};

export const formatPreJoinSpaceUrl = (spaceId: number, token: string) => {
  const path = Routes.PreJoinSpace.replace(
    ":spaceId",
    spaceId.toString(),
  ).replace(":token", token);
  return `${window.location.protocol}//${window.location.host}${path}`;
};

export const needRedirect = (pathName: string) =>
  pathName === "/" || pathName.includes("/documents/");

export const isSecurePath = (pathName: string) =>
  pathName.includes("/documents/");
