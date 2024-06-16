const LOCAL_CONFIG = {
  graphQlEndpoint: "http://localhost:8000/",
  graphQlSubscription: "ws://localhost:8000",
};

const CONFIG = {
  graphQlEndpoint: "https://graphql.ikigai.li/",
  graphQlSubscription: "wss://graphql.ikigai.li",
};

export const getConfig = () => {
  if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
    return CONFIG;
  }

  return LOCAL_CONFIG;
};

export default getConfig();
