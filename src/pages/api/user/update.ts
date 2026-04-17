import type { APIRoute } from "astro";
import { db, auth } from "../../../lib/auth";
import { user } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (ctx) => {
  const session = await auth.api.getSession({ headers: ctx.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { textName, igAcc, linkTail } = await ctx.request.json();

  if (!textName || !igAcc || !linkTail) {
    return new Response("Missing fields", { status: 400 });
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
