import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: `mysql://${process.env.PUBLIC_MYSQL_USER}:${process.env.PUBLIC_MYSQL_PASSWORD}@${process.env.PUBLIC_MYSQL_HOST}:${process.env.PUBLIC_MYSQL_PORT}/${process.env.PUBLIC_MYSQL_DEV_DATABASE}`,
  },
});
