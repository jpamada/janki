import { and, eq, isNull } from "drizzle-orm";
import { answers, questionAnswers, questions } from "@/db/schema";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getQuestions() {
  const query = await db
  .select()
  .from(questions)
  .where(
    isNull(questions.deletedAt)
  );

  return query;
}

export async function getQuestionsByLessonId(lessonId: string) {
  const query = await db
  .select()
  .from(questions)
  .where(
    and(
      eq(questions.lessonId, lessonId), 
      isNull(questions.deletedAt)
    )
  );

  return query;
}

export async function getQuestionsByLessonIdWithAnswers(
  lessonId: string,
) {
  const result = await db
    .select({
      questionId: questions.id,
      question: questions.question,

      answerId: answers.id,
      answer: answers.answer,
      isCorrect: questionAnswers.isCorrect,
    })
    .from(questions)
    .innerJoin(
      questionAnswers,
      eq(questionAnswers.questionId, questions.id),
    )
    .innerJoin(
      answers,
      eq(questionAnswers.answerId, answers.id),
    )
    .where(
      and(
        eq(questions.lessonId, lessonId),
        isNull(questions.deletedAt),
        isNull(questionAnswers.deletedAt),
        isNull(answers.deletedAt),
      ),
    );

  return result;
}

export async function getQuestionById(id: string) {
  const query = await db
  .select()
  .from(questions)
  .where(
    and(
      eq(questions.id, id), 
      isNull(questions.deletedAt)
    )
  )
  .limit(1);

  return query[0];
}

export async function createQuestion(
  input: {
    id: string;
    question: string;
    lessonId: string;
}) {
  await db
  .insert(questions)
  .values({
    id: input.id,
    question: input.question,
    lessonId: input.lessonId,
    createdAt: new Date()
  });
};

export async function createQuestionWithAnswers(
  input: {
    question: string;
    lessonId: string;
    answers: {
      answer: string;
      isCorrect: boolean;
    }[];
}): Promise<void> {
  await db.transaction(async (tx) => {
    const questionId = Crypto.randomUUID();

    await tx.insert(questions).values({
      id: questionId,
      question: input.question,
      lessonId: input.lessonId,
      createdAt: new Date(),
    });

    for (const answer of input.answers) {
      const answerId = Crypto.randomUUID();

      await tx.insert(answers).values({
        id: answerId,
        answer: answer.answer,
        lessonId: input.lessonId,
        createdAt: new Date(),
      });

      await tx.insert(questionAnswers).values({
        id: Crypto.randomUUID(),
        questionId,
        answerId,
        isCorrect: answer.isCorrect,
        createdAt: new Date(),
      });
    }
  });
}

export async function updateQuestion(
  id: string,
  input: {
    question: string;
    lessonId: string;
}) {
  await db
  .update(questions)
  .set({
    question: input.question,
    lessonId: input.lessonId,
    updatedAt: new Date(),
  })
  .where(
    eq(questions.id, id)
  );
};

export async function deleteQuestion(id: string) {
  await db
  .update(questions)
  .set({
    deletedAt: new Date(),
    updatedAt: new Date(),
  })
  .where(
    eq(questions.id, id)
  );
};