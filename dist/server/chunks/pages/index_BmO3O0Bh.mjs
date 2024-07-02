import { c as createComponent, r as renderTemplate, m as maybeRenderHead } from "../astro_BEVvFLmn.mjs";
import { normalizeDatabaseUrl, createLocalDatabaseClient, asDrizzleTable } from "@astrojs/db/runtime";
import "@astrojs/db/dist/runtime/virtual.js";

const dbUrl = normalizeDatabaseUrl(process.env.ASTRO_DATABASE_FILE, "file:///home/snsa/Desktop/astro/.astro/content.db");
const db = createLocalDatabaseClient({ dbUrl });
const Comment = asDrizzleTable(
  "Comment",
  {
    columns: {
      author: { type: "text", schema: { unique: false, deprecated: false, name: "author", collection: "Comment", primaryKey: false, optional: false } },
      body: { type: "text", schema: { unique: false, deprecated: false, name: "body", collection: "Comment", primaryKey: false, optional: false } },
    },
    deprecated: false,
    indexes: {},
  },
  false
);

const $$Index = createComponent(
  async ($$result, $$props, $$slots) => {
    const comments = await db.select().from(Comment);
    const date = Date.now();
    const environ = process.env.NODE_ENV;
    return renderTemplate`${maybeRenderHead()}<h2>Comments</h2> ${comments.map(
      ({ author, body }) => renderTemplate`<article> <p>Author: ${author}</p> <p>${body}</p> </article>`
    )} <p>Last updated: ${new Date(date).toLocaleString()}</p> <p>Environment: ${environ}</p> <img src="/img.jpg" alt="img">`;
  },
  "/home/snsa/Desktop/astro/src/pages/index.astro",
  void 0
);

const $$file = "/home/snsa/Desktop/astro/src/pages/index.astro";
const $$url = "";

export { $$Index as default, $$file as file, $$url as url };
