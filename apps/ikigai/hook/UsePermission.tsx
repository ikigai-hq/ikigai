import { DocumentActionPermission, SpaceActionPermission } from "graphql/types";
import useAuthUserStore from "../context/ZustandAuthStore";

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
