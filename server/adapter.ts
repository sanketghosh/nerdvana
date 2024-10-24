import Database from "better-sqlite3";
import "dotenv/config";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const processEnv = EnvSchema.parse(process.env);

const sqlite = new Database(processEnv.DATABASE_URL);
export const db: BetterSQLite3Database = drizzle({ client: sqlite });

// const res = await db.execute("select 1");
// console.log(res);
