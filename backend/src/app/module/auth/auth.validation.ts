import { z } from "zod";

const RegisterZodSchema = z.object({
  name: z
    .string("Name is required")
    .min(3, "Name must be at least 3 characters long")
    .max(50),
  email: z.email("Not a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least 1 special character",
    ),
});

const LoginZodSchema = z.object({
  email: z.email("Not a valid email"),
  password: z.string("Password is required").min(1, "Password is required"),
});

export const AuthValidation = {
  RegisterZodSchema,
  LoginZodSchema,
};
