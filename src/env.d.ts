/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

interface Env {
  DATABASE_URL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

declare namespace App {
  interface Locals {}
}

declare module "cloudflare:workers" {
  export const env: Env;
}
