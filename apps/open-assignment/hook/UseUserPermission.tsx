import { allow, Permission } from "util/permission";
import useAuthUserStore from "context/ZustandAuthStore";

const useUserPermission = () => {
  const user = useAuthUserStore((state) => state.currentUser);

  return (permission: Permission) => {
    if (!user) return false;

    return allow(user.userMe?.activeUserAuth?.orgRole, permission);
  };
};

export default useUserPermission;
