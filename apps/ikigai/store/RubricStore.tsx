import create from "zustand";
import { cloneDeep } from "lodash";

import { GetRubrics_userGetMyRubrics } from "graphql/types";

export type IRubric = GetRubrics_userGetMyRubrics;

export type IRubricStore = {
  rubrics: IRubric[];
  setRubrics: (rubrics: IRubric[]) => void;
  addOrUpdateRubric: (rubric: IRubric) => void;
  removeRubric: (rubricId: string) => void;
};

const useRubricStore = create<IRubricStore>((set, get) => ({
  rubrics: [],
  setRubrics: (rubrics) => set({ rubrics: cloneDeep(rubrics) }),
  addOrUpdateRubric: (rubric) => {
    const rubrics = get().rubrics;
    const existingRubric = rubrics.find((r) => r.id === rubric.id);
    Object.assign(existingRubric, cloneDeep(rubric));

    set({ rubrics });
  },
  removeRubric: (rubricId) => {
    const rubrics = get().rubrics;
    const index = rubrics.findIndex((r) => r.id === rubricId);
    if (index > -1) rubrics.splice(index, 1);
    set({ rubrics });
  },
}));

export default useRubricStore;
