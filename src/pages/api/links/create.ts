import type { APIRoute } from "astro";
import { getDB, getAuth } from "../../../lib/auth";
import { links } from "../../../db/schema";

export const POST: APIRoute = async (context) => {
  const env = (context.locals as any).runtime?.env || import.meta.env;
  const auth = getAuth(env);
  const db = getDB(env);

  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { name, reelURL, destURL } = await context.request.json();


  if (!name || !reelURL || !destURL) {
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
