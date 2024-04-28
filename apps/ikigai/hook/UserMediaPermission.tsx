import Bowser from "bowser";
import { PermissionType } from "context/ZustandDocumentStore";
import { useEffect, useState } from "react";

const userMediaPermission = (name: PermissionName) => {
  const [permission, setPermission] = useState(null);
  const browser = Bowser.getParser(window.navigator.userAgent);
  const browserName = browser.getBrowserName();
  const [status, setStatus] = useState<PermissionState>(PermissionType.PROMPT);

  const getPermissionStatus = async () => {
    if (browserName === "Chrome" || browserName === "Microsoft Edge") {
      try {
        const res = await navigator.permissions.query({ name });
        setPermission(res);
        setStatus(res.state);
      } catch (error) {
        setStatus(PermissionType.DENIED);
      }
    } else {
      setStatus(PermissionType.GRANTED);
    }
  };

  useEffect(() => {
    if (!name) return;
    getPermissionStatus();
  }, [name]);

  useEffect(() => {
    if (permission) {
      const changeHandler = (e) => setStatus(e.target.state);
      permission.addEventListener("change", changeHandler);

      return () => {
        permission.removeEventListener("change", changeHandler);
      };
    }
  }, [permission]);

  return status;
};

export default userMediaPermission;
