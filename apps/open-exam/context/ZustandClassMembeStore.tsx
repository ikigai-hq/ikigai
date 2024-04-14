import create from "zustand";
import {
  GetSpaceMembers,
  GetSpaceMembers_spaceGet_members as ISpaceMember,
  OrgRole,
} from "graphql/types";
import { query } from "../graphql/ApolloClient";
import { GET_SPACE_MEMBERS } from "graphql/query/ClassQuery";

// Type hint: Map<Space ID, Map<User ID, ISpaceMember>>
export type ClassDataType = Map<number, Map<number, ISpaceMember>>;

const addMember = (data: ClassDataType, member: ISpaceMember) => {
  const classMembers = data.get(member.spaceId);
  if (classMembers) {
    classMembers.set(member.userId, member);
  } else {
    const classMembers = new Map();
    classMembers.set(member.userId, member);
    data.set(member.spaceId, classMembers);
  }

  return data;
};

export type SpaceMemberContext = {
  data: ClassDataType;
  fetchMembersOfClass: (classId: number) => Promise<void>;
};

const useSpaceMemberStore = create<SpaceMemberContext>((set, get) => ({
  data: new Map(),
  fetchMembersOfClass: async (classId: number) => {
    const spaceMembers = await query<GetSpaceMembers>({
      query: GET_SPACE_MEMBERS,
      variables: {
        classId,
      },
    });
    if (spaceMembers) {
      const currentData = get().data;
      currentData.delete(classId);
      spaceMembers.spaceGet.members.forEach((member) => {
        addMember(currentData, member);
      });
      set({ data: currentData });
    }
  },
}));

export const useGetSpaceMembers = (classId?: number, filterRole?: OrgRole) => {
  const members = useSpaceMemberStore(state => state.data.get(classId));
  const filteredMembers = members ?
    Array.from(members.values())
      .filter((member) => {
        if (!filterRole) return true;
        return member.user.orgMember.orgRole === filterRole;
      })
    : [];

  return { members: filteredMembers };
};

export default useSpaceMemberStore;
