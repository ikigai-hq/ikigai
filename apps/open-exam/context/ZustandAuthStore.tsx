import create from "zustand";

import {OrgRole, UserMe,} from "../graphql/types";

export type UserCheckHelper = {
  isStudent: boolean;
  isTeacher: boolean;
};

export type IStore = {
  role: OrgRole,
  currentUser: UserMe | undefined;
  checkHelper: UserCheckHelper;
  setCurrentUser: (currentUser: UserMe | undefined) => void;
};

const useAuthUserStore = create<IStore>((set, _get) => ({
  role: OrgRole.STUDENT,
  currentUser: undefined,
  updateUserData: {},
  checkHelper: {
    isTeacher: false,
    isStudent: false,
  },
  setCurrentUser: (currentUser: UserMe | undefined) => {
    const isStudent =
      currentUser?.userMe?.activeUserAuth?.orgRole === OrgRole.STUDENT;
    const isTeacher =
      currentUser?.userMe?.activeUserAuth?.orgRole === OrgRole.TEACHER;
    const role = currentUser?.userMe?.activeUserAuth?.orgRole || OrgRole.STUDENT;

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
}));

export default useAuthUserStore;
