const LOCAL_CONFIG = {
  graphQlEndpoint: "http://localhost:8000/",
  graphQlSubscription: "ws://localhost:8000",
  wsEndpoint: "ws://localhost:8000/ws",
  growthBookClientId: "sdk-cIxIgrLvle1ok9TC",
  growthBookUApiHost: "https://cdn.growthbook.io",
  mixPanelToken: "e74615f362b5c599746e229bf566f94b",
};

export const getConfig = () => {
  return LOCAL_CONFIG;
};

export default getConfig();
