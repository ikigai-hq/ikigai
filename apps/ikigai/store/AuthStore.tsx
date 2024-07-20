import create from "zustand";

import {
  DocumentActionPermission,
  GetDocumentPermissions,
  GetSpacePermissions,
  Role,
  SpaceActionPermission,
  UserMe,
} from "../graphql/types";
import { cloneDeep } from "lodash";
import { query } from "../graphql/ApolloClient";
import {
  GET_DOCUMENT_PERMISSIONS,
  GET_SPACE_PERMISSIONS,
} from "../graphql/query";

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
  // Authorization
  activeDocumentPermissions: DocumentActionPermission[];
  activeSpacePermissions: SpaceActionPermission[];
  fetchDocumentPermissions: (
    documentId: string,
  ) => Promise<DocumentActionPermission[]>;
  setDocumentPermissions: (permissions: DocumentActionPermission[]) => void;
  fetchSpacePermissions: (spaceId: number) => Promise<void>;
};

const useAuthUserStore = create<IStore>((set, get) => ({
  activeDocumentPermissions: [],
  activeSpacePermissions: [],
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
  fetchDocumentPermissions: async (documentId: string) => {
    const permissions = await query<GetDocumentPermissions>({
      query: GET_DOCUMENT_PERMISSIONS,
      variables: {
        documentId,
      },
      fetchPolicy: "network-only",
    });

    set({
      activeDocumentPermissions: permissions?.documentMyPermissions || [],
    });

    return permissions?.documentMyPermissions || [];
  },
  setDocumentPermissions: (permissions) => {
    set({ activeDocumentPermissions: permissions });
  },
  fetchSpacePermissions: async (spaceId: number) => {
    const permissions = await query<GetSpacePermissions>({
      query: GET_SPACE_PERMISSIONS,
      variables: {
        spaceId,
      },
    });

    set({ activeSpacePermissions: permissions?.spaceMyPermissions || [] });
  },
}));

export default useAuthUserStore;
