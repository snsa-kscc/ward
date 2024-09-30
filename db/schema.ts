import {
  int,
  text,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const pages = mysqlTable("page", {
  id: int("id").notNull().primaryKey().autoincrement(),
  slug: text("slug"),
  title: text("title"),
  content: text("content"),
  lang: text("lang"),
});

export const portfolio = mysqlTable("portfolio", {
  id: int("id").notNull().primaryKey().autoincrement(),
  slug: varchar("slug", { length: 512 }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  title: varchar("title", { length: 512 }).unique(),
  content: text("content"),
  media: varchar("media", { length: 1024 }),
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
  slug: text("slug"),
  logo: text("logo"),
});

export const store = mysqlTable("store", {
  id: int("id").notNull().primaryKey().autoincrement(),
  section: varchar("section", { length: 255 }),
  key: varchar("key", { length: 255 }),
  value: text("value"),
  lang: varchar("lang", { length: 6 }),
});
