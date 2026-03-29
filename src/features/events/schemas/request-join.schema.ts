import { z } from "zod";

export const requestJoinSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  gender: z.enum(["MALE", "FEMALE"]),
  phone: z
    .string()
    .trim()
    .min(8, "Phone number is required.")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number."),
});

export type RequestJoinSchema = z.infer<typeof requestJoinSchema>;
