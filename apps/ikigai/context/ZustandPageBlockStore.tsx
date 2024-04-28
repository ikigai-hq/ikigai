import { mutate, query } from "graphql/ApolloClient";
import {
  GET_DOCUMENT_DETAIL,
  GET_PAGE_BLOCKS,
} from "graphql/query/DocumentQuery";
import {
  DocumentAddPageBlock,
  DocumentAddPageBlockVariables,
  GetDocumentDetail,
  GetPageBlocks,
  GetPageBlocks_documentGet_pageBlocks as IDocumentPageBlock,
  PageViewMode,
} from "graphql/types";
import { BlockData, parsePageBlock } from "util/BlockUtil";
import create from "zustand";
import { DOCUMENT_ADD_PAGE_BLOCK } from "graphql/mutation/DocumentMutation";
import { cloneDeep } from "lodash";

export type IPageBlockStore = {
  pageBlocks: IDocumentPageBlock[];
  // Map<documentId, BlockData[]>
  mapPageBlockData: Map<number, BlockData[]>;
  getPageBlocks: (documentId: string) => Promise<GetDocumentDetail[]>;
  syncPageBlocks: (body: string, documentId?: number) => void;
  pageBlockMode?: boolean;
  currentPageBlockId?: string;
  updateCurrentPageBlockId?: (pageBlockId?: string) => void;
  updatePageBlockTitle?: (
    title: string,
    pageBlockId: string,
    documentId: string,
  ) => Promise<void>;
  updatePageBlockMode?: (pageBlockMode: boolean) => void;
  updateStore?: (
    pageBlockData: Partial<IDocumentPageBlock>,
    isNewPageBlock?: boolean,
    shallow?: boolean,
  ) => void;
};

const usePageBlockStore = create<IPageBlockStore>((set, get) => ({
  pageBlocks: [],
  mapPageBlockData: new Map(),
  syncPageBlocks: (body: string, documentId?: number) => {
    const parsedPageBlocks = parsePageBlock(body);
    const currentMapPageBlock = get().mapPageBlockData.get(documentId);
    if (checkTwoPageBlocks(parsedPageBlocks, currentMapPageBlock)) {
      set(({ mapPageBlockData }) => {
        const instanceObj = new Map(mapPageBlockData);
        return {
          mapPageBlockData: instanceObj.set(documentId, parsedPageBlocks),
        };
      });
    }
  },
  getPageBlocks: async (documentId) => {
    const response = await query<GetPageBlocks>({
      query: GET_PAGE_BLOCKS,
      variables: {
        documentId,
      },
      fetchPolicy: "network-only",
    });

    if (!response) return [];

    const fetchFns = response.documentGet.pageBlocks
      .flatMap((pg) => pg.nestedDocuments.map((n) => n.documentId))
      .map(async (nestedDocumentId) => {
        return query<GetDocumentDetail>({
          query: GET_DOCUMENT_DETAIL,
          variables: {
            documentId: nestedDocumentId,
          },
          fetchPolicy: "network-only",
        });
      });
    const nestedDocuments = await Promise.all(fetchFns);

    if (nestedDocuments.length) {
      set({ pageBlocks: response.documentGet.pageBlocks });
    }

    return cloneDeep(nestedDocuments);
  },
  updatePageBlockMode: (pageBlockMode: boolean) => {
    set({ pageBlockMode });
  },
  updateCurrentPageBlockId: (pageBlockId: string) => {
    set({ currentPageBlockId: pageBlockId });
  },
  updateStore: (
    pageBlockData: Partial<IDocumentPageBlock>,
    isNewPageBlock?: boolean,
    shallow?: boolean,
  ) => {
    const newPageBlock: IDocumentPageBlock = {
      id: pageBlockData?.id,
      title: pageBlockData?.title,
      documentId: pageBlockData?.documentId,
      nestedDocuments: pageBlockData?.nestedDocuments || [],
    };
    if (shallow) {
      set(({ pageBlocks }) => ({
        pageBlocks: !isNewPageBlock
          ? pageBlocks.map((pb) =>
              pb.id === pageBlockData.id ? { ...pb, ...pageBlockData } : pb,
            )
          : pageBlocks.concat(newPageBlock),
      }));
    } else {
      set(({ pageBlocks }) => {
        const instances = cloneDeep(pageBlocks);
        isNewPageBlock && instances.push(newPageBlock);
        return {
          pageBlocks: isNewPageBlock
            ? instances
            : instances.map((item) =>
                item.id === pageBlockData.id
                  ? { ...item, ...pageBlockData }
                  : item,
              ),
        };
      });
    }
  },
  updatePageBlockTitle: async (title, pageBlockId, documentId) => {
    const variables: DocumentAddPageBlockVariables = {
      data: {
        id: pageBlockId,
        documentId,
        title,
        viewMode: PageViewMode.SPLIT,
      },
    };
    await mutate<DocumentAddPageBlock>({
      mutation: DOCUMENT_ADD_PAGE_BLOCK,
      variables,
    });
  },
}));

const checkTwoPageBlocks = (
  pageBlocks: BlockData[],
  secondPageBlocks: BlockData[],
): boolean => {
  if (pageBlocks.length !== secondPageBlocks?.length) return true;
  return pageBlocks.some((pb, index) => secondPageBlocks[index].id !== pb.id);
};

export default usePageBlockStore;
