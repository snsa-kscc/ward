import { Comment, db } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Comment).values([
    {
      author: "Astro",
      body: "Hello, world!",
    },
    {
      author: "Astronautooo",
      body: "Hello, world again!",
    },
  ]);
}
