import z from 'zod';

export const folderSchema = z.object({
  id: z
    .string()
    .trim()
    .optional(),

  categoryId: z
    .string()
    .trim(),

  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name is too long'),
});

export type FolderFormData = z.infer<typeof folderSchema>;
