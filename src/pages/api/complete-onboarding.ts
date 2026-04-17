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
