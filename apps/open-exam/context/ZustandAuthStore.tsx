import create from "zustand";

import {OrgRole, UserMe,} from "../graphql/types";
import {cloneDeep} from "lodash";

export type UserCheckHelper = {
  isStudent: boolean;
  isTeacher: boolean;
};

export type IStore = {
  role: OrgRole,
  orgId?: number,
  setOrgId: (orgId?: number) => void,
  currentUser: UserMe | undefined;
  checkHelper: UserCheckHelper;
  setCurrentUser: (currentUser: UserMe | undefined) => void;
  setProfile: (firstName: string, lastName: string) => void;
};

const useAuthUserStore = create<IStore>((set, get) => ({
  orgId: undefined,
  setOrgId: (orgId) => set({ orgId }),
  role: OrgRole.STUDENT,
  currentUser: undefined,
  updateUserData: {},
  checkHelper: {
    isTeacher: false,
    isStudent: false,
  },
  setCurrentUser: (user: UserMe | undefined) => {
    const currentUser = cloneDeep(user);
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
  setProfile: (firstName, lastName) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    
    currentUser.userMe.firstName = firstName;
    currentUser.userMe.lastName = lastName;
    set({ currentUser });
  }
}));

export default useAuthUserStore;
