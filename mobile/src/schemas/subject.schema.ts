import z from "zod";

export const subjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category is too long"),
})

export type SubjectFormData = z.infer<typeof subjectSchema>;