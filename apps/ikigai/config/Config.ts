const LOCAL_CONFIG = {
  graphQlEndpoint: "http://localhost:8000/",
  graphQlSubscription: "ws://localhost:8000",
  wsEndpoint: "ws://localhost:8000/ws",
  enableDocumentV2: false,
};

export const getConfig = () => {
  return LOCAL_CONFIG;
};

export default getConfig();
