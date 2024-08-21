import { defineMiddleware, sequence } from "astro:middleware";

// Define supported locales and default locale
const locales = ["en", "es", "fr"];
const defaultLocale = "en";

export const i18nMiddleware = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const [, segment] = url.pathname.split("/");

  if (locales.includes(segment)) {
    // If the segment is a valid locale, proceed
    return next();
  } else {
    // If no locale is specified or it's the root path
    if (defaultLocale !== "en") {
      // For non-English default, redirect to include the locale
      url.pathname = `/${defaultLocale}${url.pathname}`;
      return context.redirect(url.toString());
    }
    // For English (default), continue without changing the URL
    return next();
  }
});

export const authMiddleware = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const [, locale, path] = url.pathname.split("/");

  if (path === "admin") {
    const basicAuth = context.request.headers.get("authorization");

    if (basicAuth) {
      const [user, password] = atob(basicAuth.split(" ")[1]).split(":");

      if (
        user === import.meta.env.SITE_USER &&
        password === import.meta.env.SITE_PASSWORD
      ) {
        return next();
      }
    }

    return new Response("Auth required", {
      status: 401,
      headers: {
        "WWW-authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return next();
});

export const onRequest = sequence(i18nMiddleware, authMiddleware);
