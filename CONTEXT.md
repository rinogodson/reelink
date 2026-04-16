# 🧠 AI Agent Context & Development Guide

## 🎯 Project Overview

This is a full-stack web application utilizing Server-Side Rendering (SSR). It includes a complete authentication system with Google OAuth, a database connection to a serverless Postgres instance, and a custom user onboarding flow.

## 🛠️ Tech Stack

- **Framework:** Astro (SSR mode via `@astrojs/node` standalone)
- **Runtime & Package Manager:** Bun
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth (with Drizzle Adapter)

---

## 📂 Key File Structure

- `astro.config.mjs`: Astro & Vite configuration (handles Node SSR polyfills for Bun).
- `src/db/schema.ts`: Drizzle ORM schema definitions.
- `src/lib/auth.ts`: Better Auth configuration and Drizzle DB client initialization.
- `src/middleware.ts`: Astro middleware handling route protection and onboarding redirection.
- `src/pages/api/auth/[...all].ts`: Better Auth catch-all API route.
- `src/pages/api/complete-onboarding.ts`: API endpoint to mark onboarding as complete.
- `src/pages/index.astro`: Public landing page (Google Login).
- `src/pages/onboarding.astro`: Protected page for new users to complete setup.
- `src/pages/dashboard.astro`: Protected page for fully onboarded users.

---

## 🔐 Authentication & Middleware Flow

Authentication is handled via session cookies.
Every request passes through `src/middleware.ts` which enforces the following state machine:

1. **Unauthenticated User:** Can only access `/` (Home) and `/api/auth/*`. Redirected to `/` if attempting to access protected routes.
2. **Authenticated, but `onboardingCompleted` is `false`:** Forced to stay on `/onboarding`. Redirected here if attempting to access `/dashboard` or `/`.
3. **Authenticated & `onboardingCompleted` is `true`:** Normal user state. Has access to `/dashboard`. Redirected to `/dashboard` if attempting to access `/` or `/onboarding`.

_Note for AI:_ When adding new protected pages (e.g., `/profile`, `/settings`), you MUST update the routing logic in `src/middleware.ts` to include these new paths in the protected routes list.

---

## 📝 Standard Operating Procedures (SOPs) for AI Agent

### 1. How to Add a New Field to the `user` Table

When instructed to add a new field (e.g., `bio`, `phoneNumber`, `stripeCustomerId`) to a user, follow these exact steps:

**Step 1: Update the DB Schema**
In `src/db/schema.ts`, add the field to the `user` table:

```typescript
export const user = pgTable("user", {
  // ... existing fields
  newField: text("newField"), // <-- Add here
});
```

**Step 2: Update Better Auth Config**
Better Auth manages the `user` table. You must register the new field in `src/lib/auth.ts` inside the `user.additionalFields` object so Better Auth knows about it during session generation:

```typescript
export const auth = betterAuth({
  // ...
  user: {
    additionalFields: {
      onboardingCompleted: { type: "boolean" },
      newField: { type: "string" }, // <-- Add here
    },
  },
});
```

**Step 3: Database Migration Command**
Instruct the user to run the Drizzle push command to sync the Neon database:
`bun x drizzle-kit push`

### 2. How to Add a New Database Table

**Step 1:** Define the new table in `src/db/schema.ts` and export it.
**Step 2:** Ensure any relations (foreign keys) referencing `user.id` are correctly typed.
**Step 3:** If Better Auth does not manage the table, you DO NOT need to add it to `src/lib/auth.ts`.
**Step 4:** Instruct the user to run `bun x drizzle-kit push`.

### 3. How to Create a New Protected Route

**Step 1:** Create the new Astro page (e.g., `src/pages/settings.astro`).
**Step 2:** Retrieve the user via `const user = Astro.locals.user;`.
**Step 3:** Update `src/middleware.ts`. Add the new path to the session checks so unauthenticated users cannot access it, and un-onboarded users are redirected away from it.

### 4. How to Update the Onboarding Flow

Currently, onboarding is completed by a POST request to `/api/complete-onboarding.ts`.
If instructed to collect more data during onboarding (e.g., asking for a username):

1. Add the new field to the user table (Follow SOP 1).
2. Update the frontend form in `src/pages/onboarding.astro` to include an input field.
3. Update `src/pages/api/complete-onboarding.ts` to parse the `request.formData()` or `request.json()`.
4. Update the Drizzle `db.update(user).set({ onboardingCompleted: true, newField: value })` call in that API route.

---

## ⚠️ Important Quirks & Gotchas

- **Package Manager:** The user is using **Bun**. Always recommend `bun add <pkg>`, `bun run <script>`, or `bun x <cli>` instead of `npm` or `npx`.
- **Environment Variables:**
  - Client-side variables in Astro MUST be prefixed with `PUBLIC_`.
  - Server-side variables use `process.env.VAR_NAME` (since we added `dotenv` for Bun compatibility) or `import.meta.env.VAR_NAME`.
  - `better-auth` configuration in `src/lib/auth.ts` relies on `process.env` and explicitly maps `baseURL` and `secret`. Do not remove these mappings.
- **Vite/Bun SSR Issues:** Because of Bun + Astro SSR, `node:async_hooks` and other Node built-ins are externalized in `astro.config.mjs`. If adding libraries that rely on Node internals, ensure they are added to the `vite.ssr.external` array.
- **Astro Locals:** Types for `Astro.locals` are defined globally in `src/env.d.ts` (or similar declaration file). If you add complex objects to locals in the middleware, ensure TypeScript declarations are updated.
