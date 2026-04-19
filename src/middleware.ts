import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { getAuth } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith("/_") || pathname.includes(".")) {
    return next();
  }

  const auth = getAuth(env);

  const isAuthPage = pathname.startsWith("/api/auth");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isDashboard = pathname.startsWith("/dashboard");
  const isSettings = pathname.startsWith("/settings");
  const isHome = pathname === "/";
  const isApi = pathname.startsWith("/api") && !isAuthPage;
  const isLinks = pathname.startsWith("/links");

  const isSystemPath =
    isHome || isDashboard || isOnboarding || isSettings || isApi || isLinks;

  if (!isSystemPath || isAuthPage) {
    return next();
  }

  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session) {
    if (isDashboard || isSettings || isOnboarding) {
      return context.redirect("/");
    }
    return next();
  }

  const onboardingComplete = !!session.user.onboardingCompleted;

  if (!onboardingComplete) {
    if (!isOnboarding && pathname !== "/api/complete-onboarding") {
      return context.redirect("/onboarding");
    }
    return next();
  }

  if (onboardingComplete && (isHome || isOnboarding)) {
    return context.redirect("/dashboard");
  }

  return next();
});
