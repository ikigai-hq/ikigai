import create from "zustand";
import {
  GetClassMembers,
  GetClassMembers_classGet_members as IMember,
  OrgRole,
} from "graphql/types";
import { query } from "../graphql/ApolloClient";
import { GET_CLASS_MEMBERS } from "graphql/query/ClassQuery";

export type IClassMember = IMember;
// Type hint: Map<Class ID, Map<User ID, IClassMember>>
export type ClassDataType = Map<number, Map<number, IClassMember>>;

const addMember = (data: ClassDataType, member: IClassMember) => {
  const classMembers = data.get(member.classId);
  if (classMembers) {
    classMembers.set(member.userId, member);
  } else {
    const classMembers = new Map();
    classMembers.set(member.userId, member);
    data.set(member.classId, classMembers);
  }

  return data;
};

export type ClassMemberContext = {
  data: ClassDataType;
  addMember: (member: IClassMember) => void;
  removeMember: (member: IClassMember) => void;
  fetchMembersOfClass: (classId: number) => Promise<void>;
};

const useClassMemberStore = create<ClassMemberContext>((set, get) => ({
  data: new Map(),
  addMember: (member) => {
    const data = addMember(get().data, member);
    set({ data });
  },
  removeMember: (member) => {
    const data = get().data;
    const classMembers = data.get(member.classId);
    if (classMembers) {
      classMembers.delete(member.userId);
    }

    set({ data });
  },
  fetchMembersOfClass: async (classId: number) => {
    // Fetch new
    const classMembers = await query<GetClassMembers>({
      query: GET_CLASS_MEMBERS,
      variables: {
        classId,
      },
    });
    if (classMembers) {
      // Remove entire current class members
      const currentData = get().data;
      currentData.delete(classId);
      // Add
      classMembers.classGet.members.forEach((member) => {
        addMember(currentData, member);
      });
      set({ data: currentData });
    }
  },
}));

export const useGetClassMembers = (classId?: number, filterRole?: OrgRole) => {
  const members = useClassMemberStore(state => state.data.get(classId));
  const filteredMembers = members ?
    Array.from(members.values())
      .filter((member) => {
        if (!filterRole) return true;
        return member.user.orgMember.orgRole === filterRole;
      })
    : [];

  return { members: filteredMembers };
};

export default useClassMemberStore;
