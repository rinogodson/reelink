import type { APIRoute } from "astro";
import { getAuth } from "../../../lib/auth";

export const ALL: APIRoute = (context) => {
  // @ts-ignore
  const env = context.locals.runtime?.env || import.meta.env;
  const auth = getAuth(env);
  return auth.handler(context.request);
};
