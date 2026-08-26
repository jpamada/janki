import z from 'zod';

export const noteFolderSchema = z.object({
  id: z
    .string()
    .trim()
    .optional(),

  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name is too long'),

  categoryId: z
    .string()
    .trim(),
});

export type FolderFormData = z.infer<typeof noteFolderSchema>;
