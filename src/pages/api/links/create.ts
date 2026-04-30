import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getDB, getAuth } from "../../../lib/auth";
import { links } from "../../../db/schema";

export const POST: APIRoute = async (context) => {
  const auth = getAuth(env);
  const db = getDB(env);

  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { name, terms, destURL } = await context.request.json();


  if (!name || !terms || !destURL) {
    return new Response("Missing fields", { status: 400 });
  }

  try {
    new URL(destURL);
  } catch (e) {
    return new Response("Invalid Destination URL", { status: 400 });
  }

  const linkID = Math.random().toString(36).substring(2, 10);

  try {
    await db.insert(links).values({
      id: linkID,
      userId: session.user.id,
      name,
      terms,
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
