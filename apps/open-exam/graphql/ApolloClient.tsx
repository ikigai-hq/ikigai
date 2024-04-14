import { useMemo } from "react";

import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink,
  DefaultContext,
  MutationOptions,
} from "@apollo/client";
import { ApolloError } from "@apollo/client/errors";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { ApolloLink, split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import toast from "react-hot-toast";
import { OperationVariables } from "@apollo/client/core/types";
import { QueryOptions } from "@apollo/client/core/watchQueryOptions";

import Config from "../config/Config";
import TokenStorage from "../storage/TokenStorage";
import useAuthUserStore from "../context/ZustandAuthStore";

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

const authLink = setContext((_, { headers }) => {
  let token = TokenStorage.get();

  const finalHeaders = {
    headers: {
      ...headers,
    },
  };
  
  if (token) {
    finalHeaders.headers["authorization"] = token;
  }
  
  const activeOrgId = useAuthUserStore.getState().orgId;
  if (activeOrgId) {
    finalHeaders.headers["active-org-id"] = activeOrgId;
  }

  return finalHeaders;
});

const cleanTypeName = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    const omitTypename = (key, value) =>
      key === "__typename" ? undefined : value;
    operation.variables = JSON.parse(
      JSON.stringify(operation.variables),
      omitTypename
    );
  }
  return forward(operation).map((data) => {
    return data;
  });
});

const createIsomorphicLink = () => {
  // serverside-rendering
  if (typeof window === "undefined") {
    return createHttpLink({ uri: Config.graphQlEndpoint });
  }

  const wsLink = new WebSocketLink({
    uri: Config.graphQlSubscription,
    options: {
      reconnect: true,
      connectionParams: {
        authorization: TokenStorage.get(),
      },
    },
  });

  const httpLink = ApolloLink.from([
    cleanTypeName,
    // @ts-ignore
    authLink.concat(
      createHttpLink({
        uri: Config.graphQlEndpoint,
      })
    ),
  ]);

  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    // @ts-ignore
    wsLink,
    httpLink
  );
};

const createApolloClient = (): ApolloClient<any> => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: createIsomorphicLink() as any,
    cache: new InMemoryCache(),
    ssrForceFetchDelay: 100,
  });
};

export const initializeApollo = (
  initialState: any = null
): ApolloClient<any> => {
  const _apolloClient = apolloClient ?? createApolloClient();

  // eslint-disable-next-line max-len
  // If your page has fetching page data for server-side rendered and using Apollo Client to fetch data, the initial state get hydrated here.
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }

  // SSG and SSR that always create a new Apollo Client.
  if (typeof window === "undefined") {
    return _apolloClient;
  }

  // CSR just create Apollo Client once.
  apolloClient = apolloClient ?? _apolloClient;

  return apolloClient;
};

export const getApolloClient = initializeApollo;

export const useApollo = (initialState: any) => {
  return useMemo(() => initializeApollo(initialState), [initialState]);
};

export async function query<T = any, TVariables = OperationVariables>(
  options: QueryOptions<TVariables, T>,
  ignoreError?: boolean,
  cbHandleError?: (error: ApolloError) => void,
): Promise<T | undefined> {
  try {
    const { data, error } = await getApolloClient().query(options);
    const shouldIgnoreError = ignoreError === true;
    if (error && !shouldIgnoreError) {
      handleError(error);
    }
    if (error && cbHandleError) cbHandleError(error);

    if (data) {
      return data;
    }
  } catch (error) {
    const shouldIgnoreError = ignoreError === true;
    if (error && !shouldIgnoreError) {
      handleError(error);
    }
    if (cbHandleError) cbHandleError(error);
  }
}

export async function mutate<
  TData = any,
  TVariables = OperationVariables,
  TContext = DefaultContext
>(
  options: MutationOptions<TData, TVariables, TContext>,
  ignoreError?: boolean
): Promise<TData | undefined> {
  try {
    const { data } = await getApolloClient().mutate(options);
    if (data) {
      return data;
    }
  } catch (error) {
    const shouldIgnoreError = ignoreError === true;
    if (error && !shouldIgnoreError) {
      toast.error(error.message);
    }
  }
}

export const handleError = (e: ApolloError) => {
  let message = e.message;
  toast.error(message);
};
