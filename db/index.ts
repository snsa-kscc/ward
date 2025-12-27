import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let poolConnection;

poolConnection = mysql.createPool({
  host: import.meta.env.MYSQL_HOST || "localhost",
  user: import.meta.env.MYSQL_USER,
  database:
    process.env.NODE_ENV === "development"
      ? import.meta.env.MYSQL_DEV_DATABASE
      : import.meta.env.MYSQL_DATABASE,
  password: import.meta.env.MYSQL_PASSWORD,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
