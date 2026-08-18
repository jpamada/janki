import z from "zod";

export const questionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'Question is required')
    .max(200, 'Question is too long'),

  lessonId: z
    .string()
    .min(1, 'Lesson is required'),

  answers: z
    .array(
      z.object({
        answer: z
          .string()
          .trim()
          .min(1, 'Answer is required'),

        isCorrect: z
          .boolean(),
      }),
    )
    .refine((answers) => answers.some((answer) => answer.isCorrect), {
      message: 'At least one answer must be correct',
    })
    .min(2, 'At least two answers are required'),
});

export type QuestionFormData = z.infer<typeof questionSchema>;