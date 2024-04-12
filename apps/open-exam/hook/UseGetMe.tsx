import { useLazyQuery } from "@apollo/client";
import useAuthUserStore from "context/ZustandAuthStore";
import { USER_ME } from "graphql/query";
import { UserMe } from "graphql/types";
import TokenStorage from "storage/TokenStorage";
import tokenStorage from "storage/TokenStorage";
import UserStorage from "storage/UserStorage";
import { useState } from "react";
import { identifyMixpanel } from "../util/track";
import useOrganizationStore from "../context/ZustandOrganizationStore";

const useGetMe = () => {
  const [isNullUser, setIsNullUser] = useState(false);
  const setCurrentUser = useAuthUserStore((state) => state.setCurrentUser);

  const setOrganization = useOrganizationStore(
    (state) => state.setOrganization,
  );

  const [getUserInfo, { loading: loadingUserInfo }] = useLazyQuery<UserMe>(
    USER_ME,
    {
      onError: (errors) => {
        if (errors.graphQLErrors.length > 0 && tokenStorage.get()) {
          const error = errors.graphQLErrors[0];
          const errorCode = error.extensions.code;
          if (errorCode === 401) {
            TokenStorage.del();
            window.location.pathname = "/";
            return;
          }
        }
        setIsNullUser(true);
      },
      onCompleted: async (data: UserMe) => {
        const user = data.userMe;

        if (user) {
          const {
            id: userId,
          } = user;
          
          setCurrentUser(data);
          setOrganization(user.activeOrganization);

          UserStorage.set(userId);
          identifyMixpanel(userId);
        }
      },
    },
  );

  return { getUserInfo, loading: loadingUserInfo, isNullUser };
};

export default useGetMe;
