import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let poolConnection;
if (process.env.NODE_ENV !== "production") {
  poolConnection = mysql.createPool({
    host: import.meta.env.MYSQL_HOST,
    user: import.meta.env.MYSQL_USER,
    database: import.meta.env.MYSQL_DATABASE,
    password: import.meta.env.MYSQL_PASSWORD,
  });
} else {
  poolConnection = mysql.createPool({
    host: "localhost",
    user: import.meta.env.MYSQL_USER,
    database: import.meta.env.MYSQL_DATABASE,
    password: import.meta.env.MYSQL_PASSWORD,
  });
}

export const db = drizzle(poolConnection, { schema, mode: "default" });
