import { defineMiddleware, sequence } from "astro:middleware";

const locales = ["en", "hr"];
const defaultLocale = "en";

export const i18nMiddleware = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const [_, segment] = url.pathname.split("/");

  if (url.pathname.startsWith("/_actions") || url.pathname.startsWith("/404")) {
    return next();
  }

  if (locales.includes(segment)) {
    return next();
  } else {
    return context.rewrite(`/${defaultLocale}${url.pathname}`);
  }
});

export const authMiddleware = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const [_, locale, path] = url.pathname.split("/");

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
