import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });
  const isAuthPage = context.url.pathname.startsWith("/api/auth");
  const isOnboarding = context.url.pathname === "/onboarding";
  const isHome = context.url.pathname === "/";

  if (isAuthPage) return next();

  if (!session) {
    if (context.url.pathname === "/dashboard" || isOnboarding)
      return context.redirect("/");
    return next();
  }

  if (
    !session.user.onboardingCompleted &&
    !isOnboarding &&
    context.url.pathname !== "/api/complete-onboarding"
  ) {
    return context.redirect("/onboarding");
  }

  if (session.user.onboardingCompleted && (isHome || isOnboarding)) {
    return context.redirect("/dashboard");
  }

  return next();
});
