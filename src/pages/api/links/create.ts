import type { APIRoute } from "astro";
import { db, auth } from "../../../lib/auth";
import { links } from "../../../db/schema";

export const POST: APIRoute = async (ctx) => {
  const session = await auth.api.getSession({ headers: ctx.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { name, reelURL, destURL } = await ctx.request.json();

  if (!name || !reelURL || !destURL) {
    return new Response("Missing fields", { status: 400 });
  }

  // Generate a random ID for the link
  const linkID = Math.random().toString(36).substring(2, 10);

  try {
    await db.insert(links).values({
      id: linkID,
      userId: session.user.id,
      name,
      reelURL,
      destURL,
    });

    return new Response(JSON.stringify({ success: true, linkID }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response("Error creating link", { status: 500 });
  }
};
