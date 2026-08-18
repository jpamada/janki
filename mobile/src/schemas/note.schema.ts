import { noteSectionSchema } from './note-section.schema';
import z from 'zod';

export const noteSchema = z.object({
  folderId: z
    .string()
    .trim()
    .optional(),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(50, "Title is too long"),
  
  noteSections: z
    .array(noteSectionSchema)
    .optional(),
});

export type NoteFormData = z.infer<typeof noteSchema>;
