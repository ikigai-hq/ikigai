import React, { ReactNode, useEffect } from "react";
import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";
import useAuthUserStore from "context/ZustandAuthStore";
import config from "config/Config";

interface Props {
  children: ReactNode;
}

const growthbook = new GrowthBook({
  apiHost: config.growthBookUApiHost,
  clientKey: config.growthBookClientId,
});

const GrowthBookWrapper: React.FC<Props> = ({ children }) => {
  const currentUser = useAuthUserStore((state) => state.currentUser);

  useEffect(() => {
    growthbook.loadFeatures();
    growthbook.setAttributes({
      ...currentUser,
      browser: navigator.userAgent,
    });
  }, []);

  return (
    <GrowthBookProvider growthbook={growthbook}>{children}</GrowthBookProvider>
  );
};

export default GrowthBookWrapper;
