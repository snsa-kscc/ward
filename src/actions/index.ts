import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { rm } from "fs/promises";
import { eq, and, max } from "drizzle-orm";
import { awards, clients, brands, portfolio, store } from "@/../db/schema";
import { locales } from "@/lib/utils";
import { db } from "@/../db";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.PUBLIC_RESEND_API);

const makeTextListActions = (table: typeof clients | typeof awards) => {
  return {
    remove: defineAction({
      input: z.object({ id: z.number(), lang: z.string() }),
      handler: async ({ id, lang }) => {
        try {
          await db
            .delete(table)
            .where(and(eq(table.id, id), eq(table.lang, lang)));
        } catch (error) {
          console.error(error);
        }
        return "deleted" as const;
      },
    }),
    reorder: defineAction({
      input: z.object({
        items: z.array(z.object({ id: z.number(), order: z.number() })),
      }),
      handler: async ({ items }) => {
        for (const item of items) {
          await db
            .update(table)
            .set({ order: item.order })
            .where(eq(table.id, item.id));
        }
        return "updated" as const;
      },
    }),
    create: defineAction({
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
            .select({ maxOrder: max(table.order) })
            .from(table)
            .where(eq(table.lang, lang));
          newOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;
        }

        const result = await db
          .insert(table)
          .values({ item, createdAt: new Date(), lang, order: newOrder });
        return Number(result[0].insertId);
      },
    }),
    update: defineAction({
      input: z.object({ id: z.number(), item: z.string(), lang: z.string() }),
      handler: async ({ id, item, lang }) => {
        await db
          .update(table)
          .set({ item })
          .where(and(eq(table.id, id), eq(table.lang, lang)));
        return "updated" as const;
      },
    }),
  };
};

const clientsActions = makeTextListActions(clients);
const awardsActions = makeTextListActions(awards);

export const server = {
  deletePortfolioMedia: defineAction({
    accept: "form",
    input: z.object({ title: z.string(), item: z.string() }),
    handler: async ({ title, item }) => {
      const res = await db
        .select()
        .from(portfolio)
        .where(eq(portfolio.title, title));

      if (!res[0]?.media) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Portfolio item media not found",
        });
      }

      const filenames: string[] = JSON.parse(res[0].media);
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

      if (!res[0]) {
        return "deleted";
      }

      if (!res[0].media) {
        await db.delete(portfolio).where(eq(portfolio.title, title));
        return "deleted";
      }

      const filenames: string[] = JSON.parse(res[0].media);
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

      if (!res[0]) {
        return "deleted";
      }

      if (!res[0].logo) {
        await db.delete(brands).where(eq(brands.id, id));
        return "deleted";
      }

      const logo = res[0].logo;
      try {
        await rm(`./public/assets/brands/${logo}`);
        await db.delete(brands).where(eq(brands.id, id));
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

  reorderClients: clientsActions.reorder,
  reorderAwards: awardsActions.reorder,
  createClient: clientsActions.create,
  createAward: awardsActions.create,
  updateClient: clientsActions.update,
  updateAward: awardsActions.update,
  deleteClient: clientsActions.remove,
  deleteAward: awardsActions.remove,
};
