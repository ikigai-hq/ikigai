import { UserMe_userMe_activeOrganization as IOrganization } from "graphql/types";
import create from "zustand";

export type IOrganizationContext = {
  organization?: IOrganization;
  setOrganization: (organization?: IOrganization) => void;
};

const useOrganizationStore = create<IOrganizationContext>((set) => ({
  organization: undefined,
  setOrganization: (organization) => {

    set({
      organization,
    });
  },
}));


export default useOrganizationStore;
