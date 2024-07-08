import { defineAction, z } from "astro:actions";
import { rm } from "fs/promises";

export const server = {
  delete: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }) => {
      await rm(`./src/media/${id}`);
      return "deleted";
    },
  }),
};
