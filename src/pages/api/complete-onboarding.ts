import type { APIRoute } from "astro";
import { db, auth } from "../../lib/auth";
import { user } from "../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (ctx) => {
  const session = await auth.api.getSession({ headers: ctx.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { linkTail, igAcc, textName } = await ctx.request.json();

  if (!linkTail || !igAcc || !textName) {
    return new Response("Missing fields", { status: 400 });
  }

  await db
    .update(user)
    .set({ 
      onboardingCompleted: true,
      linkTail,
      igAcc,
      textName
    })
    .where(eq(user.id, session.user.id));

  return new Response(JSON.stringify({ success: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
