import { todayKey } from "@/constants/date";
import { db } from "@/db/client";
import { answers, progress, questionAnswers, questions } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

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

export async function startOrResumeQuiz(
  lessonId: string, 
  questionIds: string[]
) {

  const today = todayKey();

  const existingQuestions = await db
  .select()
  .from(progress)
  .where(
    and(
      eq(progress.lessonId, lessonId), 
      eq(progress.sessionDate, today)
    )
  );

  const existingQuestionIds = new Set(
    existingQuestions.map(
      (question) => question.questionId
    )
  );

  const missingQuestionIds = questionIds.filter(
    (id) => !existingQuestionIds.has(id)
  );

  if (missingQuestionIds.length > 0) {
    await db
    .insert(progress)
    .values(
      missingQuestionIds.map((questionId) => ({
        id: Crypto.randomUUID(),
        questionId: questionId,
        lessonId: lessonId,
        sessionDate: today,
        status: "unanswered" as const,
      })),
    );
  }

  const allQuestions = [
    ...existingQuestions,
    ...missingQuestionIds.map(
      (questionId) => ({ 
        questionId: questionId, 
        status: "unanswered" as const 
      })
    ),
  ];

  const quizQuestions = allQuestions
  .filter((row) => row.status !== "correct")
  .map((row) => row.questionId);

  return quizQuestions;
}

export async function resetQuiz(lessonId: string) {
  await db
    .delete(progress)
    .where(
      and(
        eq(progress.lessonId, lessonId),
        eq(progress.sessionDate, todayKey()),
      ),
    );
}