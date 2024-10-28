import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Minimum 2 characters are needed." })
    .max(20, { message: "Maximum 20 characters are allowed." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "Should not contain anything other than alphabets, numbers or underscore.",
    }),
  password: z
    .string()
    .min(6, {
      message: "Minimum six characters are needed.",
    })
    .max(255, {
      message: "Not more than 255 characters are allowed.",
    }),
});

export const signupSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Minimum 2 characters are needed." })
    .max(20, { message: "Maximum 20 characters are allowed." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "Should not contain anything other than alphabets, numbers or underscore.",
    }),
  email: z
    .string()
    .email({
      message: "Please provide a valid email address.",
    })
    .optional(),
  password: z
    .string()
    .min(6, { message: "Minimum six characters are needed." }),
});
