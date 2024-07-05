import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const poolConnection = mysql.createPool({
  host: import.meta.env.MYSQL_HOST,
  user: import.meta.env.MYSQL_USER,
  database: import.meta.env.MYSQL_DATABASE,
  password: import.meta.env.MYSQL_PASSWORD,
});

export const myDb = drizzle(poolConnection);
