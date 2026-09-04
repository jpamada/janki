import z from "zod";

export const contentSchema = z.object({
  id: z
    .string()
    .trim()
    .optional(),

  title: z
    .string()
    .trim()
    .max(50, "Title is too long"),

  content: z
    .string(),

  todo: z
    .boolean()
    .nullable(),

  url: z
    .string()
    .optional(),

  remarks: z
    .string()
    .optional(),

  position: z
    .number()
    .int()
    .min(0)
    .nullable(),
});

export type ContentFormData = z.infer<typeof contentSchema>;