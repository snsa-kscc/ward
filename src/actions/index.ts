import { defineAction, z } from "astro:actions";
import { rm } from "fs/promises";
import { eq, and } from "drizzle-orm";
import { accolades, brands, portfolio, store } from "@/../db/schema";
import { db } from "@/../db";

export const server = {
  deleteMedia: defineAction({
    input: z.object({ title: z.string(), item: z.string(), lang: z.string() }),
    handler: async ({ title, item, lang }) => {
      const res = await db
        .select()
        .from(portfolio)
        .where(and(eq(portfolio.title, title), eq(portfolio.lang, lang)));
      const filenames: string[] = JSON.parse(res[0].media as string);
      const filteredFilenames = filenames.filter(
        (filename) => filename !== item,
      );
      try {
        await rm(`./public/assets/portfolio/${item}`);
      } catch (error) {
        console.log(error);
      }
      await db
        .update(portfolio)
        .set({ media: JSON.stringify(filteredFilenames) })
        .where(and(eq(portfolio.title, title), eq(portfolio.lang, lang)));
      return "deleted";
    },
  }),

  deletePortfolio: defineAction({
    input: z.object({ title: z.string(), lang: z.string() }),
    handler: async ({ title, lang }) => {
      const res = await db
        .select()
        .from(portfolio)
        .where(and(eq(portfolio.title, title), eq(portfolio.lang, lang)));
      const filenames: string[] = JSON.parse(res[0].media as string);
      for (const filename of filenames) {
        try {
          await rm(`./public/assets/portfolio/${filename}`);
        } catch (error) {
          console.log(error);
        }
      }
      try {
        await db
          .delete(portfolio)
          .where(and(eq(portfolio.title, title), eq(portfolio.lang, lang)));
      } catch (error) {
        console.log(error);
      }
      return "deleted";
    },
  }),

  deleteBrand: defineAction({
    input: z.object({ title: z.string() }),
    handler: async ({ title }) => {
      const res = await db.select().from(brands).where(eq(brands.name, title));
      const logo = res[0].logo as string;
      try {
        await rm(`./public/assets/brands/${logo}`);
        await db.delete(brands).where(eq(brands.name, title));
      } catch (error) {
        console.log(error);
      }
      return "deleted";
    },
  }),

  deleteLogo: defineAction({
    input: z.object({ title: z.string(), item: z.string() }),
    handler: async ({ title, item }) => {
      try {
        await rm(`./public/assets/brands/${item}`);
        await db
          .update(brands)
          .set({ logo: null })
          .where(eq(brands.name, title));
      } catch (error) {
        console.log(error);
      }
      return "deleted";
    },
  }),

  deleteAccolade: defineAction({
    input: z.object({ id: z.number(), lang: z.string() }),
    handler: async ({ id, lang }) => {
      try {
        await db
          .delete(accolades)
          .where(and(eq(accolades.id, id), eq(accolades.lang, lang)));
      } catch (error) {
        console.log(error);
      }
      return "deleted";
    },
  }),

  deletePicture: defineAction({
    input: z.object({ title: z.string() }),
    handler: async ({ title }) => {
      try {
        await rm(`./public/assets/${title}`);
        await db
          .update(store)
          .set({ value: null })
          .where(eq(store.value, title));
      } catch (error) {
        console.log(error);
      }
      return "deleted";
    },
  }),
};
