import create from "zustand";

import { GetAIUsage_userMe_aiSessionsOfToday } from "graphql/types";
import { cloneDeep } from "lodash";

export type IAIUsageSession = GetAIUsage_userMe_aiSessionsOfToday;

type IAIStore = {
  maxAIUsagePerDay: number;
  setMaxAIUsagePerDay: (maxAIUsagePerDay: number) => void;
  usageOfToday: number;
  increaseUsageOfToday: (increasedVal: number) => void;
  sessions: IAIUsageSession[];
  setSessions: (sessions: IAIUsageSession[]) => void;
};

const useAIStore = create<IAIStore>((set, get) => ({
  maxAIUsagePerDay: 0,
  usageOfToday: 0,
  sessions: [],
  setMaxAIUsagePerDay: (maxAIUsagePerDay) => set({ maxAIUsagePerDay }),
  setSessions: (sessions) =>
    set({ sessions: cloneDeep(sessions), usageOfToday: sessions.length }),
  increaseUsageOfToday: (increasedVal) =>
    set({ usageOfToday: get().usageOfToday + increasedVal }),
}));

export default useAIStore;
