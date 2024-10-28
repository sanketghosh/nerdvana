// PACKAGES
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { generateId } from "lucia";

// LOCAL MODULES
import { db } from "@/adapter";
import type { Context } from "@/context";
import { userTable } from "@/db/schemas/auth";
import { lucia } from "@/lucia";
import { signupSchema } from "@/shared/schema";
import type { SuccessResponse } from "@/shared/types";
import { HTTPException } from "hono/http-exception";
import postgres from "postgres";

export const authRouter = new Hono<Context>().post(
  "/signup",
  zValidator("form", signupSchema),

  async (c) => {
    const { username, password } = c.req.valid("form");
    const passwordHash = await Bun.password.hash(password);
    const userId = generateId(15);

    try {
      await db.insert(userTable).values({
        id: userId,
        username,
        password_hash: passwordHash,
      });

      const session = await lucia.createSession(userId, { username });
      const sessionCookie = lucia.createSessionCookie(session.id).serialize();

      c.header("Set-Cookie", sessionCookie, { append: true });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "User has been created successfully.",
        },
        201,
      );
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "23505") {
        throw new HTTPException(409, {
          message: "Username is already in use.",
        });
      }

      throw new HTTPException(500, {
        message: "Internal server error. User creation failed.",
      });
    }
  },
);
