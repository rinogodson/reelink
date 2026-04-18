import type { APIRoute } from "astro";
import { getAuth } from "../../../lib/auth";

export const ALL: APIRoute = (context) => {
  // @ts-ignore
  const runtime = context.locals.runtime;
  const env = runtime?.env || process.env || import.meta.env;

  const auth = getAuth(env);
  return auth.handler(context.request);
};
