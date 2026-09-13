import z from "zod";

export const lessonSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  
  favorite: z
    .boolean(),

  subjectId: z
    .string(),
});

export type LessonFormData = z.infer<typeof lessonSchema>;