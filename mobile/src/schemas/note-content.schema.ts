import z from "zod";

export const noteContentSchema = z.object({
  id: z
    .string()
    .trim()
    .optional(),

  title: z
    .string()
    .trim()
    .max(50, "Title is too long"),

  content: z
    .string()
    .trim()
    .min(1, "Content is required"),

  type: z
    .enum(["text", "code"]),

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
    .optional(),
});

export type NoteContentFormData = z.infer<typeof noteContentSchema>;