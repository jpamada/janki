import { answers, questionAnswers, questions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getQuizData(
  lessonId: string,
) {
  const query = db.query.questions
  .findMany({
    where: eq(questions.lessonId, lessonId),
    with: {
      questionAnswers: {
        with: {
          answer: true,
        },
      },
    },
    orderBy: sql`random()`
  });

  return query;
}

export async function createQuizData(
  input: {
    question: string;
    lessonId: string;
    code: string | null;
    image: string | null;
    language: string | null;
    explanation: string | null;
    type: "multiple_choice" | "identification";
    answers: {
      answer: string;
      isCorrect: boolean;
    }[];
  },
): Promise<void> {
  await db.transaction(async (tx) => {
    const questionId = Crypto.randomUUID();

    await tx
    .insert(questions)
    .values({
      id: questionId,
      type: input.type,
      question: input.question,
      code: input.code,
      image: input.image,
      language: input.language,
      lessonId: input.lessonId,
      explanation: input.explanation,
      createdAt: new Date(),
    });

    for (const answer of input.answers) {
      const answerId = Crypto.randomUUID();

      await tx
      .insert(answers)
      .values({
        id: answerId,
        answer: answer.answer,
        lessonId: input.lessonId,
        createdAt: new Date(),
      });

      await tx
      .insert(questionAnswers)
      .values({
        id: Crypto.randomUUID(),
        questionId,
        answerId,
        isCorrect: answer.isCorrect,
        createdAt: new Date(),
      });
    }
  });
}

export async function updateQuizData(
  questionId: string,
  input: {
    question: string;
    lessonId: string;
    code: string | null;
    image: string | null;
    language: string | null;
    explanation: string | null;
    type: "multiple_choice" | "identification";

    answers: {
      answer: string;
      isCorrect: boolean;
    }[];
  },
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
    .update(questions)
    .set({
      type: input.type,
      code: input.code,
      image: input.image,
      question: input.question,
      language: input.language,
      lessonId: input.lessonId,
      explanation: input.explanation,
      updatedAt: new Date(),
    })
    .where(
      eq(questions.id, questionId),
    );

    const existingQuestionAnswers = await tx
    .select({
      answerId: questionAnswers.answerId,
    })
    .from(questionAnswers)
    .where(
      eq(questionAnswers.questionId, questionId),
    );

    await tx
    .delete(questionAnswers)
    .where(
      eq(questionAnswers.questionId, questionId),
    );

    for (const item of existingQuestionAnswers) {
      await tx
      .delete(answers)
      .where(
        eq(answers.id, item.answerId),
      );
    }

    for (const answer of input.answers) {
      const answerId = Crypto.randomUUID();

      await tx
      .insert(answers)
      .values({
        id: answerId,
        answer: answer.answer,
        lessonId: input.lessonId,
        createdAt: new Date(),
      });

      await tx
      .insert(questionAnswers)
      .values({
        id: Crypto.randomUUID(),
        questionId,
        answerId,
        isCorrect: answer.isCorrect,
        createdAt: new Date(),
      });
    }
  });
}

export async function deleteQuizData(id: string) {
  await db
  .delete(questions)
  .where(
    eq(questions.id, id)
  );
};