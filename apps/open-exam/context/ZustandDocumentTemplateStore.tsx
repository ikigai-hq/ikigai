import {
  GetCommunityTemplates_getCommunityDocumentTemplates as IDocumentTemplate,
  GetCommunityTemplateCategory_getCommunityDocumentTemplateCategories as IDocumentCategory,
} from "graphql/types";
import create from "zustand";

export enum TemplateType {
  Community = "community",
  Library = "library",
}

export type IDocumentTemplateStore = {
  openTemplateModal: boolean;
  openTemplateType: TemplateType;
  selectedPreviewTemplateId?: string;
  availableTags: string[];
  categories: Map<string, IDocumentCategory>,
  templates: Map<string, IDocumentTemplate>;
  addTemplates: (templates: IDocumentTemplate[]) => void;
  addCategories: (categories: IDocumentCategory[]) => void;
  deleteCategory: (category: IDocumentCategory) => void;
  deleteTemplate: (template: IDocumentTemplate) => void;
  addTags: (tags: string[]) => void;
  setChangeOpenTemplateModal: (openTemplateModal: boolean) => void;
  setOpenTemplateType: (templateType: TemplateType) => void;
  setSelectedPreviewTemplateId: (templateId: string | undefined) => void;
  reset: () => void;
};

const useDocumentTemplateStore = create<IDocumentTemplateStore>((set, get) => ({
  openTemplateModal: false,
  openTemplateType: TemplateType.Library,
  selectedPreviewTemplateId: undefined,
  availableTags: [],
  categories: new Map(),
  templates: new Map(),
  addTemplates: (newTemplates) => {
    const templates = get().templates;
    newTemplates.forEach(template => {
      templates.set(template.id, template);
    });
    set({ templates });
  },
  addCategories: (newCategories) => {
    const categories = get().categories;
    newCategories.forEach(category => categories.set(category.id, category));
    set({ categories });
  },
  deleteCategory: (category) => {
    const categories = get().categories;
    categories.delete(category.id);
    set({ categories });
  },
  deleteTemplate: (template) => {
    const templates = get().templates;
    templates.delete(template.id);
    set({ templates });
  },
  addTags: (tags: string[]) => {
    const availableTags = get().availableTags;
    
    tags.forEach(tag => {
      if (!availableTags.includes(tag)) availableTags.push(tag);
    });
    
    set({ availableTags });
  },
  setChangeOpenTemplateModal: (openTemplateModal) => {
    set({ openTemplateModal });
  },
  setOpenTemplateType: (openTemplateType) => {
    set({ openTemplateType });
  },
  setSelectedPreviewTemplateId: (templateId) => {
    set({ selectedPreviewTemplateId: templateId });
  },
  reset: () => {
    set({
      templates: new Map(),
      categories: new Map(),
      selectedPreviewTemplateId: undefined,
      availableTags: [],
    });
  }
}));

export default useDocumentTemplateStore;
