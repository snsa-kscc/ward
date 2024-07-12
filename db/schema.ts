import { int, text, mysqlTable, timestamp } from "drizzle-orm/mysql-core";

export const pages = mysqlTable("page", {
  id: int("id").notNull().primaryKey().autoincrement(),
  slug: text("slug"),
  title: text("title"),
  content: text("content"),
  lang: text("lang"),
});

export const portfolios = mysqlTable("portfolio", {
  id: int("id").notNull().primaryKey().autoincrement(),
  slug: text("slug"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  title: text("title"),
  content: text("content"),
  media: text("media"),
  lang: text("lang"),
});

export const accolades = mysqlTable("accolade", {
  id: int("id").notNull().primaryKey().autoincrement(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  item: text("item"),
  lang: text("lang"),
});

export const brands = mysqlTable("brand", {
  id: int("id").notNull().primaryKey().autoincrement(),
  name: text("name"),
  logo: text("logo"),
});

export const meta = mysqlTable("meta", {
  id: int("id").notNull().primaryKey().autoincrement(),
  key: text("key"),
  value: text("value"),
  lang: text("lang"),
});
