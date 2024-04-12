import {
  GetOrganizationMembers,
  GetOrganizationMembers_orgFindMembers,
  GetOrganizationMembers_orgFindMembers_items,
  OrgRole,
  UserMe_userMe_activeOrganization as IOrganization,
} from "graphql/types";
import { Moment } from "moment/moment";
import { useEffect, useMemo, useState } from "react";
import { cloneDeep, debounce } from "lodash";
import create from "zustand";
import { useLazyQuery } from "@apollo/client";

import { GET_ORGANIZATION_MEMBERS } from "graphql/query";
import { handleError } from "graphql/ApolloClient";
import { getDateAsSec } from "util/Time";

export type IMember = {
  userId: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    randomColor: string;
    id: number;
    avatar: {
      publicUrl?: string;
    };
    phoneNumber?: string;
  };
  orgRole?: OrgRole;
};

export type BrandingData = {
  orgName: string;
  orgLogoUrl: string;
};

export type IOrganizationContext = {
  organization?: IOrganization;
  branding?: BrandingData;
  setOrganization: (organization?: IOrganization) => void;
  organizationMembers: GetOrganizationMembers_orgFindMembers_items[];
  totalMember: number;
  setOrganizationMembers: (data: GetOrganizationMembers_orgFindMembers) => void;
  activeMemberId?: number;
  setActiveMember: (activeMemberId: number) => void;
};

const useOrganizationStore = create<IOrganizationContext>((set) => ({
  organization: undefined,
  branding: undefined,
  setOrganization: (organization) => {
    const orgName = organization.orgName;
    const branding: BrandingData = {
      orgName,
      orgLogoUrl: "/logo.png",
    };

    set({
      organization,
      branding,
    });
  },
  organizationMembers: [],
  totalMember: 0,
  setOrganizationMembers: (data) => {
    set({
      organizationMembers: data.items,
      totalMember: data.total,
    });
  },
  setActiveMember: (userId) => {
    set({
      activeMemberId: cloneDeep(userId),
    });
  },
}));

export const getOffset = (page: number, limit: number) => (page - 1) * limit;
export const MEMBER_PER_PAGE = 10;

export const useLoadOrganizationMembers = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<OrgRole | undefined>();
  const [createdDateRange, setCreatedDateRange] = useState<
    [Moment, Moment] | null
  >();

  const members = useOrganizationStore((state) => state.organizationMembers);
  const total = useOrganizationStore((state) => state.totalMember);
  const setOrganizationMembers = useOrganizationStore(
    (state) => state.setOrganizationMembers,
  );

  const [fetch, { loading }] = useLazyQuery<GetOrganizationMembers>(
    GET_ORGANIZATION_MEMBERS,
    {
      onError: handleError,
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        setOrganizationMembers(data.orgFindMembers);
      },
    },
  );

  const debounceFetch = useMemo(
    () =>
      debounce(
        (
          keyword: string | undefined,
          role: OrgRole | undefined,
          createdAtFrom: Number | undefined,
          createdAtTo: Number | undefined,
          offset: number,
        ) => {
          const filterOptions = {
            keyword,
            role,
            createdAtFrom,
            createdAtTo,
            paging: {
              offset,
              limit: MEMBER_PER_PAGE,
            },
          };
          fetch({ variables: { filterOptions } });
        },
        300,
      ),
    [],
  );

  const fetchData = () => {
    debounceFetch(
      keyword,
      role,
      createdDateRange ? getDateAsSec(createdDateRange[0]) : undefined,
      createdDateRange ? getDateAsSec(createdDateRange[1]) : undefined,
      getOffset(page, MEMBER_PER_PAGE),
    );
  };

  useEffect(() => {
    fetchData();
  }, [page, keyword, role, createdDateRange]);

  return {
    loading,
    fetch: fetchData,
    members,
    total,
    page,
    setPage,
    keyword,
    setKeyword,
    role,
    setRole,
    createdDateRange,
    setCreatedDateRange,
  };
};

export default useOrganizationStore;
