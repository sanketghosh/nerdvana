import Database from "bun:sqlite";
import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { z } from "zod";

const EnvSchema = z.object({
  DB_FILE_NAME: z.string().url(),
});

const processEnv = EnvSchema.parse(process.env);

const sqlite = new Database(processEnv.DB_FILE_NAME);
export const db = drizzle({ client: sqlite });
