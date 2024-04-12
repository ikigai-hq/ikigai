import create from "zustand";

import {
  UserMe,
  OrgRole,
  UpdateUserData,
  UserUpdateInfo,
} from "../graphql/types";
import { mutate, query } from "../graphql/ApolloClient";
import { UpdateUserInfo } from "../graphql/mutation";
import toast from "react-hot-toast";
import { USER_ME } from "graphql/query";

export type UserCheckHelper = {
  isStudent: boolean;
  isTeacher: boolean;
};

export type IStore = {
  currentUser: UserMe | undefined;
  updateUserData: Partial<UpdateUserData>;
  setCurrentUser: (currentUser: UserMe | undefined) => void;
  setUpdateUserData: (updateUserData: Partial<UpdateUserData>) => void;
  checkHelper: UserCheckHelper;
  updateInfo: (data: Partial<UpdateUserData>) => Promise<boolean>;
  onSubmitUpdateUserData: () => void;
  refreshUpdateUserData: () => void;
};

const useAuthUserStore = create<IStore>((set, get) => ({
  currentUser: undefined,
  updateUserData: {},
  checkHelper: {
    isTeacher: false,
    isStudent: false,
  },
  setCurrentUser: (currentUser: UserMe | undefined) => {
    const isStudent =
      currentUser?.userMe?.activeOrgMember?.orgRole === OrgRole.STUDENT;
    const isTeacher =
      currentUser?.userMe?.activeOrgMember?.orgRole === OrgRole.TEACHER;

    const checkHelper = {
      isStudent,
      isTeacher,
    };

    const updateUserData = {
      firstName: currentUser.userMe.firstName,
      lastName: currentUser.userMe.lastName,
      avatarFileId: currentUser.userMe.avatarFileId,
    };

    set({
      checkHelper,
      currentUser,
      updateUserData,
    });
  },
  updateInfo: async (data: Partial<UpdateUserData>): Promise<boolean> => {
    const currentUser = get().currentUser.userMe;
    const updateData: UpdateUserData = {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      avatarFileId: currentUser.avatarFileId,
      ...data,
    };
    const res = await mutate<UserUpdateInfo>({
      mutation: UpdateUserInfo,
      variables: {
        input: updateData,
      },
    });

    if (!!res) {
      const data = await query<UserMe>({ query: USER_ME });
      console.log("Updated", data);
      get().setCurrentUser(data);
      toast.success("Updated!");
    }

    return !!res;
  },
  setUpdateUserData: (data: Partial<UpdateUserData>) => {
    const updateUserData = get().updateUserData;
    set({ updateUserData: { ...updateUserData, ...data } });
  },
  onSubmitUpdateUserData: () => {
    const updateUserData = get().updateUserData;
    get().updateInfo(updateUserData);
  },
  refreshUpdateUserData: () => {
    const currentUser = get().currentUser;
    const updateUserData = {
      firstName: currentUser.userMe.firstName,
      lastName: currentUser.userMe.lastName,
      avatarFileId: currentUser.userMe.avatarFileId,
    };
    set({ updateUserData: updateUserData });
  },
}));

export default useAuthUserStore;
