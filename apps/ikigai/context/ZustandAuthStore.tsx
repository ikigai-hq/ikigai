import create from "zustand";

import { Role, UserMe } from "../graphql/types";
import { cloneDeep } from "lodash";

export type UserCheckHelper = {
  isStudent: boolean;
  isTeacher: boolean;
};

export type IStore = {
  role: Role;
  spaceId?: number;
  setSpaceId: (spaceId?: number) => void;
  currentUser: UserMe | undefined;
  checkHelper: UserCheckHelper;
  setCurrentUser: (currentUser: UserMe | undefined) => void;
  setProfile: (firstName: string, lastName: string) => void;
};

const useAuthUserStore = create<IStore>((set, get) => ({
  spaceId: undefined,
  setSpaceId: (spaceId) => set({ spaceId }),
  role: Role.STUDENT,
  currentUser: undefined,
  updateUserData: {},
  checkHelper: {
    isTeacher: false,
    isStudent: false,
  },
  setCurrentUser: (user: UserMe | undefined) => {
    const currentUser = cloneDeep(user);
    const isStudent =
      currentUser?.userMe?.activeUserAuth?.role === Role.STUDENT;
    const isTeacher =
      currentUser?.userMe?.activeUserAuth?.role === Role.TEACHER;
    const role = currentUser?.userMe?.activeUserAuth?.role || Role.STUDENT;

    const checkHelper = {
      isStudent,
      isTeacher,
    };

    set({
      role,
      checkHelper,
      currentUser,
    });
  },
  setProfile: (firstName, lastName) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    currentUser.userMe.firstName = firstName;
    currentUser.userMe.lastName = lastName;
    set({ currentUser });
  },
}));

export default useAuthUserStore;
