import { defineAction, z } from "astro:actions";
import { rm } from "fs/promises";
import { eq } from "drizzle-orm";
import { portfolios } from "@/../db/schema";
import { db } from "@/../db";

export const server = {
  deleteMedia: defineAction({
    input: z.object({ title: z.string(), item: z.string() }),
    handler: async ({ title, item }) => {
      const res = await db.select().from(portfolios).where(eq(portfolios.title, title));
      const filenames: string[] = JSON.parse(res[0].media as string);
      const filteredFilenames = filenames.filter((filename) => filename !== item);
      try {
        await rm(`./src/media/${item}`);
      } catch (error) {
        console.log(error);
      }
      await db
        .update(portfolios)
        .set({ media: JSON.stringify(filteredFilenames) })
        .where(eq(portfolios.title, title));
      return "deleted";
    },
  }),
};
