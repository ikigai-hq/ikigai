import Loading from "components/Loading";
import { isNonAuthenticatePage, Routes } from "config/Routes";
import useAuthUserStore from "context/ZustandAuthStore";
import useGetMe from "hook/UseGetMe";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect } from "react";
import TokenStorage from "storage/TokenStorage";
import UserStorage from "storage/UserStorage";

interface Props {
  children: ReactNode;
}

export const AuthenticatedWrapper: React.FC<Props> = ({ children }: Props) => {
  const router = useRouter();
  const token = TokenStorage.get();

  const authUser = useAuthUserStore((state) => state.currentUser);
  const { getUserInfo, loading, isNullUser } = useGetMe();

  const moveToSignIn = () => {
    TokenStorage.del();
    UserStorage.del();
    router.push(Routes.SignIn);
  };

  useEffect(() => {
    // Wrong token
    if (isNullUser && token) {
      moveToSignIn();
      return;
    }

    if (token && !loading && !authUser) {
      getUserInfo();
      return;
    }
  }, [token, authUser, isNullUser]);

  if (
    !isNonAuthenticatePage(router.pathname) &&
    !token
  ) {
    return <Loading />;
  }

  return <>{children}</>;
};
