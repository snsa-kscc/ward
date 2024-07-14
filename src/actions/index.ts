import { defineAction, z } from "astro:actions";
import { rm } from "fs/promises";
import { eq } from "drizzle-orm";
import { portfolio } from "@/../db/schema";
import { db } from "@/../db";

export const server = {
  deleteMedia: defineAction({
    input: z.object({ title: z.string(), item: z.string() }),
    handler: async ({ title, item }) => {
      const res = await db.select().from(portfolio).where(eq(portfolio.title, title));
      const filenames: string[] = JSON.parse(res[0].media as string);
      const filteredFilenames = filenames.filter((filename) => filename !== item);
      try {
        await rm(`./src/media/portfolio/${item}`);
      } catch (error) {
        console.log(error);
      }
      await db
        .update(portfolio)
        .set({ media: JSON.stringify(filteredFilenames) })
        .where(eq(portfolio.title, title));
      return "deleted";
    },
  }),

  deletePortfolio: defineAction({
    input: z.object({ title: z.string() }),
    handler: async ({ title }) => {
      const res = await db.select().from(portfolio).where(eq(portfolio.title, title));
      const filenames: string[] = JSON.parse(res[0].media as string);
      for (const filename of filenames) {
        try {
          await rm(`./src/media/portfolio/${filename}`);
        } catch (error) {
          console.log(error);
        }
      }
      try {
        await db.delete(portfolio).where(eq(portfolio.title, title));
      } catch (error) {
        console.log(error);
      }
      return "deleted";
    },
  }),
};
