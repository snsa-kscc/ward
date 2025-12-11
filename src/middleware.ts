import { defineMiddleware, sequence } from "astro:middleware";
import { locales, defaultLocale } from "@/lib/utils";

export const i18nMiddleware = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const [_, segment] = url.pathname.split("/");

  if (url.pathname.startsWith("/_actions") || url.pathname.startsWith("/404")) {
    return next();
  }

  if (segment && locales.includes(segment)) {
    return next();
  } else {
    return context.rewrite(`/${defaultLocale}${url.pathname}`);
  }
});

export const authMiddleware = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const [_, __, path] = url.pathname.split("/");

  if (path === "admin") {
    const basicAuth = context.request.headers.get("authorization");

    if (basicAuth) {
      const authParts = basicAuth.split(" ");
      const token = authParts[1];

      if (token) {
        const decoded = atob(token);
        const [user, password] = decoded.split(":");

        if (
          user === import.meta.env.PUBLIC_SITE_USER &&
          password === import.meta.env.PUBLIC_SITE_PASSWORD
        ) {
          return next();
        }
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
