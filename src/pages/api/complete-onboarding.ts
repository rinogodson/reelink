import type { APIRoute } from "astro";
import { db, auth } from "../../lib/auth";
import { user } from "../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (ctx) => {
  const session = await auth.api.getSession({ headers: ctx.request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  await db
    .update(user)
    .set({ onboardingCompleted: true })
    .where(eq(user.id, session.user.id));

  return new Response(null, { status: 200 });
};
