import z from "zod";

export const lessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  
  subjectId: z
    .string(),
})

export type LessonFormData = z.infer<typeof lessonSchema>;