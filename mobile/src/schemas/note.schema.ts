import z from 'zod';

export const noteSchema = z.object({
  folderId: z
    .string()
    .trim()
    .nullable(),

  subfolderId: z
    .string()
    .trim()
    .nullable(),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(50, "Title is too long"),
});

export type NoteFormData = z.infer<typeof noteSchema>;
