import { z } from "zod";

export const questionSchema = z.object({
  type: z
    .enum([
      "multiple_choice", 
      "identification"
    ]),

  question: z
    .string()
    .trim()
    .min(1, 'Question is required')
    .max(500, 'Question is too long'),

  explanation: z
    .string()
    .min(1, 'Explanation is required')
    .max(400, 'Explanation is too long')
    .nullable(),

  code: z
    .string()
    .nullable(),

  language: z
    .string()
    .nullable(),

  image: z
    .string()
    .nullable(),

  lessonId: z
    .string()
    .trim()
    .min(1, "Lesson is required"),

  answers: z.array(
    z.object({
      answer: z
        .string()
        .trim()
        .min(1, 'Answer is required')
        .max(250, "Answer is too long"),

      isCorrect: z
        .boolean(),
    }),
  ),
}).superRefine((data, ctx) => {
  const correctCount = data.answers.filter(
    (answer) => answer.isCorrect
  ).length;

  if (data.type === 'multiple_choice') {
    if (data.answers.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'At least two answers are required',
      });
    }

    if (correctCount !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'Exactly one answer must be correct',
      });
    }
  }

  if (data.type === 'identification') {
    if (data.answers.length !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'Identification needs exactly one answer',
      });
    }

    if (correctCount !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'The identification answer must be marked correct',
      });
    }
  }
});

export type QuestionFormData = z.infer<typeof questionSchema>;