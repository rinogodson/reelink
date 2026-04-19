import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getDB, getAuth } from "../../../lib/auth";
import { user } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (context) => {
  const auth = getAuth(env);
  const db = getDB(env);

  const session = await auth.api.getSession({ headers: context.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { textName, igAcc, linkTail } = await context.request.json();

  if (!textName || !igAcc || !linkTail) {
    return new Response("Missing fields", { status: 400 });
  }

  const igRegex = /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?(\?.*)?$/;
  if (!igRegex.test(igAcc)) {
    return new Response("Invalid Instagram Account Link", { status: 400 });
  }

  if (/\s/.test(linkTail)) {
    return new Response("Link Tail cannot contain spaces", { status: 400 });
  }

  if (textName.length >= 18) {
    return new Response("Display Name must be less than 18 characters", { status: 400 });
  }

  try {
    await db
      .update(user)
      .set({ textName, igAcc, linkTail })
      .where(eq(user.id, session.user.id));

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("User update error:", err);
    return new Response("Error updating user information", { status: 500 });
  }
};
