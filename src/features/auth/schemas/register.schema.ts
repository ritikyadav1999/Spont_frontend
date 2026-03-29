import { z } from "zod";

const phoneRegex = /^\+?[0-9]{10,15}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  gender: z.enum(["MALE", "FEMALE"], {
    error: "Select a gender.",
  }),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number."),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

