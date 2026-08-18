import z from "zod";

export const answerSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, 'Answer is required')
    .max(100, 'Answer is too long'),
    
  lessonId: z
    .string()
    .trim()
    .min(1, 'Lesson is required')
});

export type AnswerFormData = z.infer<typeof answerSchema>;