import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getDB, getAuth } from "../../../lib/auth";
import { links } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const DELETE: APIRoute = async (context) => {
  const auth = getAuth(env);
  const db = getDB(env);

  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await context.request.json();

  if (!id) {
    return new Response("Missing ID", { status: 400 });
  }

  try {
    await db
      .delete(links)
      .where(
        and(
          eq(links.id, id),
          eq(links.userId, session.user.id)
        )
      );

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response("Error deleting link", { status: 500 });
  }
};
