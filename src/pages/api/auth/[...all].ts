import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getAuth } from "../../../lib/auth";

export const ALL: APIRoute = (context) => {
  const auth = getAuth(env);
  return auth.handler(context.request);
};
