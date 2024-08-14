import create from "zustand";
import { UserMe_userMe_userConfig } from "../graphql/types";
import { cloneDeep } from "lodash";

export type UserConfig = UserMe_userMe_userConfig;

type IAIStore = {
  config?: UserConfig;
  setUserConfig: (maxAIUsagePerDay: UserConfig) => void;
  usageOfToday: number;
  increaseUsageOfToday: (increasedVal: number) => void;
};

const useUsageConfigStore = create<IAIStore>((set, get) => ({
  config: undefined,
  usageOfToday: 0,
  sessions: [],
  setUserConfig: (config) => set({ config: cloneDeep(config) }),
  increaseUsageOfToday: (increasedVal) =>
    set({ usageOfToday: get().usageOfToday + increasedVal }),
}));

export const isUsageValid = (key: keyof UserConfig, value: number) => {
  const config = useUsageConfigStore.getState().config;
  const maxValue = config[key];
  return _isUsageValid(value, maxValue);
};

export const useUsageValid = (key: keyof UserConfig, value: number) => {
  const config = useUsageConfigStore((state) => state.config);
  const maxValue = config[key];
  return _isUsageValid(value, maxValue);
};

export const _isUsageValid = (value: number, maxValue?: number) => {
  if (typeof maxValue !== "number") return true;
  return maxValue > value;
};

export default useUsageConfigStore;
