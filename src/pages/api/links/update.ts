import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getDB, getAuth } from "../../../lib/auth";
import { links } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const PUT: APIRoute = async (context) => {
  const auth = getAuth(env);
  const db = getDB(env);

  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id, reelURL, destURL } = await context.request.json();

  if (!id || !reelURL || !destURL) {
    return new Response("Missing fields", { status: 400 });
  }

  const reelRegex = /^https:\/\/(www\.)?instagram\.com\/reel\/[a-zA-Z0-9._-]+\/?(\?.*)?$/;
  if (!reelRegex.test(reelURL)) {
    return new Response("Invalid Instagram Reel Link", { status: 400 });
  }

  try {
    new URL(destURL);
  } catch (e) {
    return new Response("Invalid Destination URL", { status: 400 });
  }

  try {
    const result = await db
      .update(links)
      .set({ reelURL, destURL })
      .where(and(eq(links.id, id), eq(links.userId, session.user.id)));

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response("Error updating link", { status: 500 });
  }
};
