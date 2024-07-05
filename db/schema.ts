import { int, text, primaryKey, mysqlTable } from "drizzle-orm/mysql-core";

export const users = mysqlTable("user", {
  id: int("id").notNull().primaryKey().autoincrement(),
  name: text("name"),
  body: text("body"),
});
