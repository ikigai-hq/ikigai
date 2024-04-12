import mixpanel from "mixpanel-browser";

import Config from "config/Config";

export const initMixpanel = () => {
  mixpanel.init(Config.mixPanelToken, { debug: true, track_pageview: true, persistence: 'localStorage' });
};

export const identifyMixpanel = (userId: number) => {
  mixpanel.identify(userId.toString());
};
