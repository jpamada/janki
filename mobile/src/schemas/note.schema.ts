import { z } from 'zod';

export const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),

  content: z
    .string(),
});

export type NoteFormData = z.infer<typeof noteSchema>;
