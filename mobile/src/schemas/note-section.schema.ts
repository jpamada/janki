import { noteContentSchema } from "./note-content.schema";
import z from "zod";

export const noteSectionSchema = z.object({
  id: z
    .string()
    .trim()
    .optional(),
    
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(50, "Title is too long"),

  position: z
    .number()
    .int()
    .min(0)
    .optional(),

  noteContents: z
    .array(noteContentSchema)
    .optional(),
})

export type NoteSectionFormData = z.infer<typeof noteSectionSchema>;