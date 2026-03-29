import { z } from "zod";

export const hostEventSchema = z
  .object({
    title: z.string().trim().min(3, "Event title is required."),
    description: z.string().trim().min(10, "Add at least a short description."),
    startDate: z.string().min(1, "Start date is required."),
    startTime: z.string().min(1, "Start time is required."),
    endDate: z.string().min(1, "End date is required."),
    endTime: z.string().min(1, "End time is required."),
    locationQuery: z.string().trim().min(2, "Search and select a location."),
    locationName: z.string().trim().min(2, "Select a location from search results."),
    latitude: z.number(),
    longitude: z.number(),
    maxParticipants: z
      .number()
      .int()
      .min(1, "Capacity must be at least 1.")
      .max(5000, "Capacity is too large."),
    joinMode: z.enum(["OPEN", "APPROVAL_REQUIRED"]),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    status: z.enum(["SCHEDULED", "ONGOING", "CANCELLED", "COMPLETED"]),
  })
  .refine(
    (values) => {
      const start = new Date(`${values.startDate}T${values.startTime}`);
      const end = new Date(`${values.endDate}T${values.endTime}`);
      return end > start;
    },
    {
      message: "End time must be later than start time.",
      path: ["endTime"],
    },
  );

export type HostEventSchema = z.infer<typeof hostEventSchema>;
