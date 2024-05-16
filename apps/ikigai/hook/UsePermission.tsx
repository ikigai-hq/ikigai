import { DocumentActionPermission, SpaceActionPermission } from "graphql/types";
import useAuthUserStore from "../context/AuthStore";

export const allow = (
  permission: DocumentActionPermission | SpaceActionPermission,
) => {
  const documentPermissions =
    useAuthUserStore.getState().activeDocumentPermissions;
  const spacePermissions = useAuthUserStore.getState().activeSpacePermissions;
  const permissions = [...documentPermissions, ...spacePermissions];
  return permissions.includes(permission);
};

const usePermission = () => {
  const documentPermissions = useAuthUserStore(
    (state) => state.activeDocumentPermissions,
  );
  const spacePermissions = useAuthUserStore(
    (state) => state.activeSpacePermissions,
  );

  const permissions = [...documentPermissions, ...spacePermissions];
  return (permission: DocumentActionPermission | SpaceActionPermission) =>
    permissions.includes(permission);
};

export default usePermission;
