export enum Routes {
  Home = "/",
  DocumentDetail = "/documents/:documentId",
  PreJoinSpace = "/spaces/:spaceId/join/:token",
  NotFound = "/404",
}

export const formatDocumentRoute = (documentId: string) => {
  return Routes.DocumentDetail.replace(":documentId", documentId.toString());
};

export const formatPreJoinSpaceUrl = (spaceId: number, token: string) => {
  const path = Routes.PreJoinSpace.replace(
    ":spaceId",
    spaceId.toString(),
  ).replace(":token", token);
  return `${window.location.protocol}//${window.location.host}${path}`;
};
