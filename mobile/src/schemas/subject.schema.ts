import z from "zod";

export const subjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  
  categoryId: z
    .string()
    .trim()
    .nullable(),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;