import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { rm } from "fs/promises";
import { eq, and, max } from "drizzle-orm";
import { clients, brands, portfolio, store } from "@/../db/schema";
import { locales } from "@/lib/utils";
import { db } from "@/../db";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.PUBLIC_RESEND_API);

export const server = {
  deletePortfolioMedia: defineAction({
    accept: "form",
    input: z.object({ title: z.string(), item: z.string() }),
    handler: async ({ title, item }) => {
      const res = await db
        .select()
        .from(portfolio)
        .where(eq(portfolio.title, title));
      const filenames: string[] = JSON.parse(res[0].media as string);
      const filteredFilenames = filenames.filter(
        (filename) => filename !== item,
      );
      try {
        await rm(`./public/assets/portfolio/${item}`);
      } catch (error) {
        console.error(error);
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
      const res = await db
        .select()
        .from(portfolio)
        .where(eq(portfolio.title, title));
      const filenames: string[] = JSON.parse(res[0].media as string);
      for (const filename of filenames) {
        try {
          await rm(`./public/assets/portfolio/${filename}`);
        } catch (error) {
          console.error(error);
        }
      }
      try {
        await db.delete(portfolio).where(eq(portfolio.title, title));
      } catch (error) {
        console.error(error);
      }
      return "deleted";
    },
  }),

  deleteBrand: defineAction({
    input: z.object({ id: z.number() }),
    handler: async ({ id }) => {
      const res = await db.select().from(brands).where(eq(brands.id, id));
      const logo = res[0].logo as string;
      try {
        await rm(`./public/assets/brands/${logo}`);
        await db.delete(brands).where(eq(brands.id, id));
      } catch (error) {
        console.error(error);
      }
      return "deleted";
    },
  }),

  deleteClient: defineAction({
    input: z.object({ id: z.number(), lang: z.string() }),
    handler: async ({ id, lang }) => {
      try {
        await db
          .delete(clients)
          .where(and(eq(clients.id, id), eq(clients.lang, lang)));
      } catch (error) {
        console.error(error);
      }
      return "deleted";
    },
  }),

  deleteMedia: defineAction({
    input: z.object({ title: z.string() }),
    handler: async ({ title }) => {
      try {
        await rm(`./public/assets/${title}`);
        for (const loc of locales) {
          await db
            .update(store)
            .set({ value: null })
            .where(and(eq(store.value, title), eq(store.lang, loc)));
        }
      } catch (error) {
        console.error(error);
      }
      return "deleted";
    },
  }),

  newsletterSubscribe: defineAction({
    accept: "form",
    input: z.object({ email: z.string().email() }),
    handler: async ({ email }) => {
      const { data, error } = await resend.contacts.create({
        email,
        audienceId: import.meta.env.PUBLIC_RESEND_AUDIENCE_ID,
      });
      if (!data || error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error while sending the newsletter",
        });
      }
      return { success: true };
    },
  }),

  reorderPortfolio: defineAction({
    input: z.object({
      items: z.array(z.object({ id: z.number(), order: z.number() })),
    }),
    handler: async ({ items }) => {
      for (const item of items) {
        await db
          .update(portfolio)
          .set({ order: item.order })
          .where(eq(portfolio.id, item.id));
      }
      return "updated";
    },
  }),

  reorderBrands: defineAction({
    input: z.object({
      items: z.array(z.object({ id: z.number(), order: z.number() })),
    }),
    handler: async ({ items }) => {
      for (const item of items) {
        await db
          .update(brands)
          .set({ order: item.order })
          .where(eq(brands.id, item.id));
      }
      return "updated";
    },
  }),

  reorderClients: defineAction({
    input: z.object({
      items: z.array(z.object({ id: z.number(), order: z.number() })),
    }),
    handler: async ({ items }) => {
      for (const item of items) {
        await db
          .update(clients)
          .set({ order: item.order })
          .where(eq(clients.id, item.id));
      }
      return "updated";
    },
  }),

  createClient: defineAction({
    input: z.object({
      item: z.string(),
      lang: z.string(),
      order: z.number().optional(),
    }),
    handler: async ({ item, lang, order }) => {
      let newOrder;

      if (order !== undefined) {
        newOrder = order;
      } else {
        const maxOrderResult = await db
          .select({ maxOrder: max(clients.order) })
          .from(clients)
          .where(eq(clients.lang, lang));
        newOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;
      }

      const result = await db
        .insert(clients)
        .values({ item, createdAt: new Date(), lang, order: newOrder });
      return result[0].insertId;
    },
  }),

  updateClient: defineAction({
    input: z.object({ id: z.number(), item: z.string(), lang: z.string() }),
    handler: async ({ id, item, lang }) => {
      await db
        .update(clients)
        .set({ item })
        .where(and(eq(clients.id, id), eq(clients.lang, lang)));
      return "updated";
    },
  }),
};
