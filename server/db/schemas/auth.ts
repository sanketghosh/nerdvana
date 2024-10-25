import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  avatar: text("avatar"),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id)
    .notNull(),
  expiresAt: integer("expires_at", {
    mode: "timestamp",
  }).notNull(),
});

// export type User = InferSelectModel<typeof userTable>;
// export type SessionTable = InferSelectModel<typeof sessionTable>;
