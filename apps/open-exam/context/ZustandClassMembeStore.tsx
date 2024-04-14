import create from "zustand";
import {
  GetSpaceMembers,
  GetSpaceMembers_spaceGet_members as ISpaceMember,
  OrgRole,
} from "graphql/types";
import { query } from "../graphql/ApolloClient";
import { GET_SPACE_MEMBERS } from "graphql/query/ClassQuery";

// Type hint: Map<Space ID, Map<User ID, ISpaceMember>>
export type SpaceMembersType = Map<number, Map<number, ISpaceMember>>;

const addMember = (data: SpaceMembersType, member: ISpaceMember) => {
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
  data: SpaceMembersType;
  fetchMembersOfClass: (spaceId: number) => Promise<void>;
};

const useSpaceMemberStore = create<SpaceMemberContext>((set, get) => ({
  data: new Map(),
  fetchMembersOfClass: async (spaceId: number) => {
    const spaceMembers = await query<GetSpaceMembers>({
      query: GET_SPACE_MEMBERS,
      variables: {
        spaceId,
      },
    });
    if (spaceMembers) {
      const currentData = get().data;
      currentData.delete(spaceId);
      spaceMembers.spaceGet.members.forEach((member) => {
        addMember(currentData, member);
      });
      set({ data: currentData });
    }
  },
}));

export const useGetSpaceMembers = (spaceId?: number, filterRole?: OrgRole) => {
  const members = useSpaceMemberStore(state => state.data.get(spaceId));
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
