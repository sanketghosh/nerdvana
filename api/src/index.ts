// import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

// app.get("/ui", swaggerUI({ url: "/doc" }));

export default app;
