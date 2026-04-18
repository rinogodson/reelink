import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

export function getDB(env: any) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export function getAuth(env: any) {
  const db = getDB(env);

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    user: {
      additionalFields: {
        onboardingCompleted: { type: "boolean" },
        linkTail: { type: "string" },
        igAcc: { type: "string" },
        textName: { type: "string" },
      },
    },
  });
}
