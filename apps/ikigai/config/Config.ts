const LOCAL_CONFIG = {
  graphQlEndpoint: "http://localhost:8000/",
  graphQlSubscription: "ws://localhost:8000",
  googleClientId:
    "441850897535-l0k9mkf5l6p9iv98tb8n0ov1pmfkl19i.apps.googleusercontent.com",
  privacyPage: "https://ikigai.li/policy",
  termPage: "https://ikigai.li/term",
};

const CONFIG = {
  graphQlEndpoint: "https://graphql.ikigai.li/",
  graphQlSubscription: "wss://graphql.ikigai.li",
  googleClientId:
    "441850897535-l0k9mkf5l6p9iv98tb8n0ov1pmfkl19i.apps.googleusercontent.com",
  privacyPage: "https://ikigai.li/policy",
  termPage: "https://ikigai.li/term",
};

export const getConfig = () => {
  if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
    return CONFIG;
  }

  return LOCAL_CONFIG;
};

export default getConfig();
