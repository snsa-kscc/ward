import { defineMiddleware, sequence } from "astro:middleware";
import { middleware } from "astro:i18n";

export const userMiddleware = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);

  if (url.pathname.startsWith("/admin")) {
    const basicAuth = context.request.headers.get("authorization");

    if (basicAuth) {
      const [user, password] = Buffer.from(basicAuth.split(" ")[1], "base64")
        .toString()
        .split(":");

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

export const onRequest = sequence(userMiddleware);
