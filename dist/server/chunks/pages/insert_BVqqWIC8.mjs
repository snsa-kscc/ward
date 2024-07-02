import { c as createComponent, r as renderTemplate, m as maybeRenderHead, d as createAstro } from "../astro_BEVvFLmn.mjs";
import { normalizeDatabaseUrl, createLocalDatabaseClient, asDrizzleTable } from "@astrojs/db/runtime";
import "@astrojs/db/dist/runtime/virtual.js";

const dbUrl = normalizeDatabaseUrl(process.env.ASTRO_DATABASE_FILE, "file:///home/snsa/Desktop/astro/.astro/content.db/.astro/content.db");
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

const $$Astro = createAstro();
const $$Insert = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
    Astro2.self = $$Insert;
    if (Astro2.request.method === "POST") {
      const formData = await Astro2.request.formData();
      const author = formData.get("author");
      const body = formData.get("body");
      if (typeof author === "string" && typeof body === "string") {
        await db.insert(Comment).values({ author, body });
      }
    }
    const comments = await db.select().from(Comment);
    return renderTemplate`${maybeRenderHead()}<form method="POST" style="display: grid"> <label for="author">Author</label> <input id="author" name="author"> <label for="body">Body</label> <textarea id="body" name="body"></textarea> <button type="submit">Submit</button> </form> <h2>Comments</h2> ${comments.map(
      ({ author, body }) => renderTemplate`<article> <p>Author: ${author}</p> <p>${body}</p> </article>`
    )}`;
  },
  "/home/snsa/Desktop/astro/src/pages/insert.astro",
  void 0
);

const $$file = "/home/snsa/Desktop/astro/src/pages/insert.astro";
const $$url = "/insert";

export { $$Insert as default, $$file as file, $$url as url };
