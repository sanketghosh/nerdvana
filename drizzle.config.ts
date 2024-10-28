import dotenv from "dotenv";
import { defineConfig, type Config } from "drizzle-kit";

dotenv.config({
  path: ".env",
});

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./server/db/schemas/*",
  strict: true,
  dbCredentials: {
    url: process.env["DATABASE_URL"]!,
  },
}) as Config;
