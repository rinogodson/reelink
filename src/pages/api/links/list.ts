import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getDB, getAuth } from "../../../lib/auth";
import { links } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

export const GET: APIRoute = async ({ request, locals }) => {
  const auth = getAuth(env);
  const db = getDB(env);

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, session.user.id))
    .orderBy(desc(links.createdAt))
    .limit(limit)
    .offset(offset);

  return new Response(JSON.stringify(userLinks), {
    headers: { "Content-Type": "application/json" },
  });
};
