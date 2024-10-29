import type { Context } from "@/context";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const isLoggedIn = createMiddleware<Context>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "User is not logged in" });
  }
  await next();
});
