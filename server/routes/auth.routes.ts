// PACKAGES
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { generateId } from "lucia";
import postgres from "postgres";

// LOCAL MODULES
import { db } from "@/adapter";
import type { Context } from "@/context";
import { userTable } from "@/db/schemas/auth";
import { lucia } from "@/lucia";
import { isLoggedIn } from "@/middleware/is-logged-in";
import { loginSchema, signupSchema } from "@/shared/schema";
import type { SuccessResponse } from "@/shared/types";

/**
 *
 *
 */

export const authRouter = new Hono<Context>()
  .post("/signup", zValidator("form", signupSchema), async (c) => {
    const { username, password, email } = c.req.valid("form");
    const passwordHash = await Bun.password.hash(password);
    const userId = generateId(15);

    try {
      await db.insert(userTable).values({
        id: userId,
        username,
        email,
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
  })
  .post("/login", zValidator("form", loginSchema), async (c) => {
    const { password, username } = c.req.valid("form");

    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1);

    if (!existingUser) {
      throw new HTTPException(401, {
        message: "User with this username does not exist.",
      });
    }

    const validPassword = Bun.password.verify(
      password,
      existingUser.password_hash,
    );

    if (!validPassword) {
      throw new HTTPException(401, {
        message: "Password is not correct.",
      });
    }

    const session = await lucia.createSession(existingUser.id, { username });
    const sessionCookie = lucia.createSessionCookie(session.id).serialize();

    c.header("Set-Cookie", sessionCookie, { append: true });

    return c.json<SuccessResponse>(
      {
        success: true,
        message: "Logged in successfully",
      },
      200,
    );
  })
  .get("/logout", async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.redirect("/");
    }

    await lucia.invalidateSession(session.id);
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
    return c.redirect("/");
  })
  .get("/user", isLoggedIn, async (c) => {
    const user = c.get("user")!;
    return c.json<SuccessResponse<{ username: string }>>({
      success: true,
      message: "User has been fetched.",
      data: {
        username: user.username,
      },
    });
  });
