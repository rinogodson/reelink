import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isSystemPath =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/onboarding" ||
    pathname === "/settings" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/links");

  if (!isSystemPath) {
    return next();
  }

  const session = await auth.api.getSession({
    headers: context.request.headers,
  });
  const isAuthPage = pathname.startsWith("/api/auth");
  const isOnboarding = pathname === "/onboarding";
  const isHome = pathname === "/";

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
