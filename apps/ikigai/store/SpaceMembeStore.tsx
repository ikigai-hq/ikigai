import create from "zustand";
import {
  GetSpaceMembers,
  GetSpaceMembers_spaceGet_members,
  Role,
} from "graphql/types";
import { query } from "graphql/ApolloClient";
import { GET_SPACE_MEMBERS } from "graphql/query/SpaceQuery";
import useSpaceStore from "./SpaceStore";

export type ISpaceMember = GetSpaceMembers_spaceGet_members;

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
  fetchMembersOfSpace: (spaceId: number) => Promise<void>;
  removeSpaceMember: (member: ISpaceMember) => void;
};

const useSpaceMemberStore = create<SpaceMemberContext>((set, get) => ({
  data: new Map(),
  fetchMembersOfSpace: async (spaceId: number) => {
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
  removeSpaceMember: (member: ISpaceMember) => {
    const members = get().data;
    const spaceMembers = members.get(member.spaceId);
    if (spaceMembers) {
      spaceMembers.delete(member.userId);
      set({ data: members });
    }
  },
}));

export const useGetSpaceMembers = (
  filterRole?: Role,
  skipUserIds?: number[],
) => {
  const spaceId = useSpaceStore((state) => state.spaceId);
  const members = useSpaceMemberStore((state) => state.data.get(spaceId));
  const filteredMembers = members
    ? Array.from(members.values())
        .filter((member) => {
          if (!filterRole) return true;
          return member.role === filterRole;
        })
        .filter((member) => {
          if (skipUserIds) {
            return !skipUserIds.includes(member.userId);
          }
          return true;
        })
    : [];

  return { members: filteredMembers };
};

export default useSpaceMemberStore;
