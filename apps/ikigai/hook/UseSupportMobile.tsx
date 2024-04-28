import { useEffect, useState } from "react";

export const LIMIT_SCREEN_SIZE = 700;

const useSupportMobile = () => {
  const [mobile, setMobile] = useState(
    window && window?.innerWidth <= LIMIT_SCREEN_SIZE,
  );

  const handleWindowSizeChange = () => {
    setMobile(window.innerWidth <= LIMIT_SCREEN_SIZE);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  return { isMobileView: mobile };
};

export const isMobileView = () => {
  return window && window.innerWidth <= LIMIT_SCREEN_SIZE;
};

export default useSupportMobile;
