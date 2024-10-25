import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import Database from "better-sqlite3";
import "dotenv/config";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { z } from "zod";
import { sessionTable, userTable } from "./db/schemas/auth";

const EnvSchema = z.object({
  DB_FILE_NAME: z.string().url(),
});

const processEnv = EnvSchema.parse(process.env);

const sqlite = new Database(processEnv.DB_FILE_NAME);
export const db = drizzle(sqlite, {
  schema: {
    user: userTable,
    session: sessionTable,
  },
});

export const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);
