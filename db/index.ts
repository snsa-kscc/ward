import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let poolConnection;

poolConnection = mysql.createPool({
  host: import.meta.env.PUBLIC_MYSQL_HOST || "localhost",
  user: import.meta.env.PUBLIC_MYSQL_USER,
  database: import.meta.env.PUBLIC_MYSQL_DATABASE,
  password: import.meta.env.PUBLIC_MYSQL_PASSWORD,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
