import {
  int,
  text,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const pages = mysqlTable("page", {
  id: int("id").notNull().primaryKey().autoincrement(),
  name: varchar("name", { length: 512 }),
  slug: varchar("slug", { length: 512 }),
  title: varchar("title", { length: 512 }),
  content: text("content"),
  lang: varchar("lang", { length: 6 }),
});

export const portfolio = mysqlTable("portfolio", {
  id: int("id").notNull().primaryKey().autoincrement(),
  slug: varchar("slug", { length: 512 }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  title: varchar("title", { length: 512 }).unique(),
  subtitle: text("subtitle"),
  content: text("content"),
  media: varchar("media", { length: 1024 }),
  order: int("order").default(0),
});

export const clients = mysqlTable("client", {
  id: int("id").notNull().primaryKey().autoincrement(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  item: text("item"),
  lang: text("lang"),
  order: int("order").default(0),
});

export const brands = mysqlTable("brand", {
  id: int("id").notNull().primaryKey().autoincrement(),
  logo: text("logo"),
  order: int("order").default(0),
});

export const store = mysqlTable("store", {
  id: int("id").notNull().primaryKey().autoincrement(),
  section: varchar("section", { length: 255 }),
  key: varchar("key", { length: 255 }),
  value: text("value"),
  lang: varchar("lang", { length: 6 }),
});
