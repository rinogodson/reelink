import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(import.meta.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export const auth = betterAuth({
  // ADD THIS LINE
  baseURL: import.meta.env.BETTER_AUTH_URL,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  socialProviders: {
    google: {
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
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
