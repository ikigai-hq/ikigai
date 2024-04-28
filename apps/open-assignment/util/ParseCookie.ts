import { IncomingMessage } from "http";

import cookie from "cookie";

type Req = IncomingMessage & {
  cookies: any;
};

export const parseCookies = (req: Req) => {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie);
};
