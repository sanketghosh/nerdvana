// PACKAGES
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

// LOCAL MODULES
import type { Context } from "@/context";
import { lucia } from "@/lucia";
import type { ErrorResponse } from "@/shared/types";
import { authRouter } from "./routes/auth.routes";

const app = new Hono<Context>();

/**
 * Middleware to handle session management and CORS.
 *
 * This middleware checks for a session cookie in the incoming request.
 * If a valid session ID is found, it validates the session and retrieves
 * the corresponding user information. It also manages the session cookies
 * based on the freshness of the session.
 *
 * @function
 * @param {Object} c - The context object containing request and response information.
 * @param {Function} next - The next middleware function in the stack.
 *
 * @returns {Promise<void>} - A promise that resolves when the next middleware is called.
 *
 * @throws {Error} - Throws an error if session validation fails or if there are issues with cookie serialization.
 *
 * @example
 * app.use("*", cors(), async (c, next) => {
 *   // Middleware implementation
 * });
 */

app.use("*", cors(), async (c, next) => {
  const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }

  c.set("session", session);
  c.set("user", user);
  return next();
});

const routes = app.basePath("/api/v1").route("/auth", authRouter);

/**
 *  Global Error Handler for the Hono app.
 *
 * @description This function catches and handles errors globally within the application.
 * If the error is an instance of `HTTPException`, it constructs a JSON response
 * using the error message and status. It also checks if the error is related to
 * a form submission based on the `err.cause` object.
 * For other errors, it returns a generic internal server error message,
 * with the error stack or message included if not in production mode.
 *
 * @param {Error} err - The error object thrown in the application.
 * @param {Context} c - The context object representing the request and response.
 * @returns {Response} A JSON response with error details and appropriate HTTP status code.
 *
 * @type ErrorResponse
 * @property {boolean} success - Indicates if the operation was successful. Always false for errors.
 * @property {string} error - The error message.
 * @property {boolean} isFormError - Optional flag indicating if the error is related to a form.
 *
 * @example
 * app.onError((err, c) => {
 *   // Handles HTTP exceptions with custom error response
 *   // Returns internal server error for non-HTTP exceptions
 * });
 */

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errorResponse =
      err.res ??
      c.json<ErrorResponse>(
        {
          success: false,
          error: err.message,
          isFormError:
            err.cause && typeof err.cause === "object" && "form" in err.cause
              ? err.cause.form === true
              : false,
        },
        err.status,
      );
    return errorResponse;
  }

  return c.json<ErrorResponse>(
    {
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : (err.stack ?? err.message),
    },
    500,
  );
});

export default app;
export type APIRoutes = typeof routes;
